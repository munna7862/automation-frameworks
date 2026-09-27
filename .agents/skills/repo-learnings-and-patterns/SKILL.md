---
name: repo-learnings-and-patterns
description: Comprehensive knowledge base of repository architectural learnings, troubleshooting recipes, environment quirks, and testing standards across Playwright, JMeter, Render staging, chaos handling, and CI/CD pipelines.
---

# Repository Learnings, Patterns & Troubleshooting Playbook

This skill is the **comprehensive reference manual** for the `AutomationFrameworks` monorepo. It details lessons learned from real-world test executions, failure investigations, and architectural migrations.

---

## 1. Playwright Test Architecture & Browser Policy

### A. The Single-Browser Rule (Google Chrome UI & API Only)
- **Problem**: Previously, `playwright.config.ts` configured 8 browser/device targets (`chromium`, `Google Chrome`, `firefox`, `webkit`, `mobile-chrome`, `mobile-safari`). This caused:
  - 380 tests to execute on every `npm test` run (each UI test was executed 6 times).
  - High CI runtime, excessive memory pressure, and browser launch crashes on environments missing Firefox/WebKit dependencies.
- **Decision & Current State**: **Strictly Google Chrome (`channel: 'chrome'`) and API**.
- **Configuration Pattern in `playwright.config.ts`**:
  ```ts
  projects: [
    {
      name: 'setup',
      testMatch: /.*auth\.setup\.ts/,
      use: {
        channel: 'chrome',
      },
    },
    {
      name: 'api',
      testDir: path.resolve(__dirname, '../tests/api'),
      testMatch: /.*\.spec\.ts/,
      use: {
        baseURL: envConfig.apiBaseUrl,
        extraHTTPHeaders: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'x-bypass-rate-limit': 'true',
        },
      },
    },
    {
      name: 'chrome',
      dependencies: ['setup'],
      testDir: path.resolve(__dirname, '../tests/ui'),
      testMatch: /.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        viewport: { width: 1280, height: 720 },
        launchOptions: {
          args: ['--disable-notifications', '--disable-infobars', '--disable-extensions', '--start-maximized'],
        },
        storageState: authFile,
      },
    },
  ]
  ```

### B. Auth Setup Project Trap
- **Issue**: `setup` project executes `src/tests/auth.setup.ts` using `{ page }` to authenticate the user and save `.auth/user.json`.
- **Trap**: If `use: { channel: 'chrome' }` is omitted from `setup`, Playwright defaults to looking for bundled `chromium_headless_shell`. In CI (Ubuntu), running `npx playwright install --with-deps chrome` installs the Google Chrome deb package, **not** `chromium_headless_shell`.
- **Result of Trap**: `setup` crashes immediately with `Executable doesn't exist`, and Playwright skips **all 54 UI tests** because they depend on `setup`.
- **Fix**: Always ensure `setup` project specifies `channel: 'chrome'`.

### C. Standard NPM Test Runners (`playwright-e2e/package.json`)
```bash
# Run all tests (setup -> api + chrome UI)
npm test

# Run API suite only
npm run test:api

# Run Chrome UI suite only
npm run test:e2e:chrome
npm run test:e2e:ui

# Run Smoke tests only (excluding quarantined)
npm run test:smoke

# Run Visual Regression tests
npm run test:e2e:visual
```

---

## 2. Render Staging Infrastructure & Cold Starts

### A. Free-Tier Idling Behavior
- **Staging Base URLs**:
  - Web UI: `https://buggy-books-fe.onrender.com`
  - REST API: `https://buggy-books.onrender.com`
- **Behavior**: Render free instances spin down after ~15 minutes of inactivity. When a request arrives, the instance wakes up ("cold start"), taking between 30 and 60 seconds.
- **Symptom if Unhandled**: Tests running immediately in CI will fail with `TimeoutError: page.goto: Navigation timeout of 30000ms exceeded` or API ECONNRESET/socket hang-ups.

### B. Mandatory Pre-Flight Wake-Up Probe
Before running any tests against Render in CI or local environments, always wake both instances:
```bash
echo "Pinging Render backend and frontend to wake from sleep..."
curl -s -o /dev/null -w "Backend wake ping status: %{http_code}\n" https://buggy-books.onrender.com/api/books || true
curl -s -o /dev/null -w "Frontend wake ping status: %{http_code}\n" https://buggy-books-fe.onrender.com/ || true
npx wait-on -t 90000 https://buggy-books.onrender.com/api/books
npx wait-on -t 90000 https://buggy-books-fe.onrender.com/
```

---

## 3. Chaos Engineering & State Mutation Containment

### A. Intentional Chaos Endpoints
The BuggyBooks backend provides endpoints to configure intentional failure modes for testing resilience:
- `POST /api/test/config`: Accepts configuration parameters:
  - `checkoutFailureRate`: Number between 0.0 and 1.0 (e.g. 1.0 forces all checkouts to return 500).
  - `inventoryDelayMs`: Number in milliseconds (e.g. 3000 injects a 3-second delay into `/api/inventory/report`).
  - `flakyCheckoutErrorRate`: Number (e.g. 0.15 simulates 15% intermittent 500 errors).
- `POST /api/test/reset`: Restores database and resets chaos flags to default zero.

### B. State Leak Trap & Mandatory Reset Hook
- **Trap**: `POST /api/test/config` mutates global state on the **shared Render staging backend**.
- **Case Study (CI Run 24)**: Test `API_CHAOS_01` set `checkoutFailureRate: 1.0` to verify that checkout returns 500. Because it lacked a teardown hook, `checkoutFailureRate` stayed at 1.0. A parallel test (`API_LOG_04` in `Test_001_LoggingAndCorrelationApi.spec.ts`) called `/api/checkout/process` and failed unexpectedly with 500.
- **Strict Pattern**: Any test modifying chaos settings **must** declare `test.afterEach`:
  ```ts
  test.afterEach(async ({ request }) => {
    await request.post('/api/test/config', {
      data: { checkoutFailureRate: 0, inventoryDelayMs: 0 }
    });
    await request.post('/api/test/reset');
  });
  ```

### C. Testing Intentional Anti-Patterns
| Anti-Pattern | Endpoint / UI Area | Strategy |
| :--- | :--- | :--- |
| **Flaky Checkout** | `POST /api/checkout/process` returns 500 ~15% of the time | Implement retry with backoff in test utility; do not remove assertions. |
| **Dynamic UI Delays** | "Add to Cart" button (500–3500ms delay) | Use auto-waiting Playwright assertions (`expect(locator).toHaveText(...)`), never hardcoded `waitForTimeout()`. |
| **Obfuscated Locators** | Missing IDs on book catalog items | Use semantic ARIA queries (`getByRole`, `getByLabel`) or relative XPath with axes. |
| **Shadow DOM** | `<order-summary-box>` encapsulates price | Rely on Playwright's automatic shadow DOM piercing locators. |

---

## 4. Apache JMeter Performance Testing

### A. Directory Structure (`jmeter/`)
```text
jmeter/
├── README.md                              # Comprehensive CLI & GUI execution manual
├── TestData/
│   ├── catalog_search.csv                 # Parameterized search terms & book IDs
│   ├── users.csv                          # Parameterized authentication credentials
│   └── UserId.csv                         # Legacy user IDs for CRUD tests
├── Tests/
│   ├── BuggyBooks_Catalog_Load.jmx        # TC-PERF-JM-001 (Catalog browsing & search SLA < 3000ms)
│   ├── BuggyBooks_Auth_Stress.jmx         # TC-PERF-JM-002 (Dynamic UUID registration & token extraction)
│   ├── BuggyBooks_Ecommerce_Journey.jmx   # TC-PERF-JM-003 (Login -> Browse -> Cart -> Checkout)
│   ├── BuggyBooks_Inventory_Stress.jmx    # TC-PERF-JM-004 (Contention stress on delayed inventory report)
│   └── CRUDPerformanceTest.jmx            # Legacy baseline performance test
└── Results/                               # Generated .jtl logs and HTML dashboard folders
```

### B. Headless CLI Execution Commands
```bash
# BuggyBooks Catalog Load Test with HTML Dashboard
jmeter -n -t jmeter/Tests/BuggyBooks_Catalog_Load.jmx -l jmeter/Results/catalog.jtl -e -o jmeter/Results/catalog-dashboard

# BuggyBooks Auth Stress Test
jmeter -n -t jmeter/Tests/BuggyBooks_Auth_Stress.jmx -l jmeter/Results/auth.jtl

# BuggyBooks Full E-Commerce Journey
jmeter -n -t jmeter/Tests/BuggyBooks_Ecommerce_Journey.jmx -l jmeter/Results/journey.jtl

# BuggyBooks Inventory Delay Stress
jmeter -n -t jmeter/Tests/BuggyBooks_Inventory_Stress.jmx -l jmeter/Results/inventory.jtl
```

### C. CI/CD Workflow (`.github/workflows/jmeter-performance.yaml`)
- Provides `workflow_dispatch` with parameters:
  - `test_plan`: Select from all 5 `.jmx` test plans.
  - `threads`: Number of virtual users (default: 10).
  - `ramp_time`: Concurrency ramp-up period in seconds (default: 15).
  - `iterations`: Loop iteration count (default: 5).
  - `target_host`: Target host (default: `buggy-books.onrender.com`).
- Features: Automated Render pre-flight wake-up probe, Apache JMeter 5.6.3 installation, HTML dashboard generation, and markdown KPI table output in `$GITHUB_STEP_SUMMARY`.

---

## 5. Documentation Synchronization Standards

### A. The Dual-Catalog Parity Rule
- Every test added, updated, or retired must be updated in **two files** in exact parity:
  1. [`docs/test_cases_catalog.md`](../../docs/test_cases_catalog.md)
  2. [`playwright-e2e/test_cases_catalog.md`](../../playwright-e2e/test_cases_catalog.md)
- Verify zero diff between the two files using:
  ```bash
  git diff docs/test_cases_catalog.md playwright-e2e/test_cases_catalog.md
  ```

### B. Catalog Entry Schema
```markdown
| ID | Title | Description | Priority | Target Coverage | Tags | Covered |
|:---|:---|:---|:---|:---|:---|:---|
| **TC-XXX-001** | Test Title | Detailed description of steps and assertions. | Critical | Feature / Layer | `@smoke` `@regression` | **Yes**<br>- Plan/Spec: `path/to/spec.ts`<br>- Command: `npm run ...`<br>- Assertions: Specific SLA or assertion details |
```

---

## 6. Pull Request & Git Hygiene

1. **Pre-Commit Checks**:
   - `npm run typecheck` across workspaces (must exit 0).
   - `npm run lint` across workspaces (must exit 0).
   - Confirm `.auth/` directory is not staged (`.gitignore` must contain `.auth/`).
2. **Commit Message Format**:
   - `feat(scope): concise description`
   - `fix(scope): concise description`
   - `docs(scope): concise description`
3. **PR Description Structure**:
   ```markdown
   ## 📌 Summary of Changes
   - Clear bullet points of what was added or fixed.

   ## 🧪 Verification
   - Exact CLI commands executed.
   - Test results (e.g. "110 passed, 0 failed in 12s").
   ```

---

## 7. Multi-Framework Testing Standards (BuggyBooks Alignment)

### A. Selenium WebDriver (`selenium-e2e/`)
- **Browser Target**: Headless Google Chrome (`options.addArguments('--headless=new')`).
- **Dynamic Waiting**: Rely on `driver.wait(until.elementLocated(locator))` and `until.elementIsEnabled()`. Never use `Thread.sleep` or static timeouts.
- **Shadow DOM Traversal**: Pierce custom Web Components like `<order-summary-box>` using standard W3C `host.getShadowRoot()`.

### B. WebdriverIO (`wdio-e2e/`)
- **Capabilities**: Chrome headless (`goog:chromeOptions: { args: ['--headless', '--disable-gpu'] }`).
- **Shadow DOM**: Use native WebdriverIO `$('order-summary-box').shadow$('.order-total')`.
- **E2E Journeys**: Aligned with BuggyBooks user flows (auth, catalog search, cart mutations, checkout).

### C. Appium Mobile Automation (`mobile-automation/`)
- **Architecture**: Appium 2.x with `UiAutomator2` (Android) and `XCUITest` (iOS).
- **Screen Objects**: All screens extend `BaseMobileScreen.ts` with touch gesture helpers (`swipeUp`, `scrollToText`).
- **Chaos Resilience**: Automated specs for orientation shifts (`driver.setOrientation('LANDSCAPE')`), network latency, and app backgrounding.

### D. k6 Fast-Feedback Performance (`k6-performance/`)
- **Synergy with JMeter**: k6 handles developer-centric PR baseline drift gates (< 60s runtime), while Apache JMeter generates enterprise stress load and HTML reports.
- **Regression Formula**:
  $$\text{Drift \%} = \frac{\text{Current p95} - \text{Baseline p95}}{\text{Baseline p95}} \times 100$$
  If drift exceeds **20%**, the test triggers an automated failure.

---

## 8. The 10 Strategic Monorepo Transformation Pillars

| Pillar | Focus Area | Core Objective |
| :--- | :--- | :--- |
| **Pillar 1** | Multi-Framework Parity | Migrate Selenium and WDIO away from dummy sites to BuggyBooks. |
| **Pillar 2** | Workspaces & Utilities | Unify `@automationframeworks/playwright-utils` under `packages/` via npm workspaces. |
| **Pillar 3** | Mobile Automation | Import Appium 2.x suite from `buggy-books` with Screen Objects and chaos specs. |
| **Pillar 4** | Chaos Testing Guide | Author `docs/intentional_bugs.md` detailing all 8 anti-patterns and safe reset recipes. |
| **Pillar 5** | CI/CD Hygiene | Purge 4 dead extensionless workflow files and standardize on valid YAML syntax. |
| **Pillar 6** | Environment Templates | Standardize `.env.example` templates in root and all sub-projects. |
| **Pillar 7** | Chrome Visual Baseline | Calibrate golden snapshots for `Test_010_VisualRegressionChaos.spec.ts` under Chrome. |
| **Pillar 8** | Dual Performance Engine | Integrate k6 baseline drift checking alongside Apache JMeter 5.6+ stress plans. |
| **Pillar 9** | PR Quality Gate | Implement fast `.github/workflows/pr-gate.yml` (< 3 mins) on PRs to `main`. |
| **Pillar 10** | Centralized Allure Portal | Host interactive executive reporting dashboard on GitHub Pages with subpaths per framework. |

---

## 9. Virtual Sprint Team Operating Model (7 Personas)

The monorepo operates with 7 specialized virtual agent personas in `.agents/skills/`:
1. [**`role-scrum-master`**](../role-scrum-master/SKILL.md): Sprint ceremony facilitation, 63 SP velocity tracking, DoR/DoD enforcement, blocker removal.
2. [**`role-sdet-architect`**](../role-sdet-architect/SKILL.md): Strategy, dual-catalog sync, monorepo workspaces, review gates.
3. [**`role-playwright-automation`**](../role-playwright-automation/SKILL.md): Google Chrome UI + API specs, POMs, self-healing, visual regression.
4. [**`role-selenium-specialist`**](../role-selenium-specialist/SKILL.md): Selenium WebDriver TypeScript, BuggyBooks POMs, ChromeDriver headless, Shadow DOM.
5. [**`role-mobile-appium-specialist`**](../role-mobile-appium-specialist/SKILL.md): Appium 2.x + WebdriverIO, Screen Objects, gestures, mobile chaos.
6. [**`role-performance-engineer`**](../role-performance-engineer/SKILL.md): Dual-engine performance: Apache JMeter 5.6+ stress plans and k6 baseline drift gates.
7. [**`role-devops-engineer`**](../role-devops-engineer/SKILL.md): CI/CD pipelines, Render warm-up probes, Allure Pages deployment, PR release lifecycle.

---

## 10. Sprint Roadmap Navigation & Planning Structure

The entire roadmap is organized under [`planning/`](../../planning/):
- **Master Plan**: [`planning/Master/master_plan.md`](../../planning/Master/master_plan.md)
- **5 Delivery Phases**: [`planning/Phases/`](../../planning/Phases/)
- **15 Granular Sprints**: [`planning/Sprints/`](../../planning/Sprints/)
- **Executive Sitemap**: [`planning/README.md`](../../planning/README.md)

---

## 11. GitHub Actions Workflow Sanitation & Extensionless File Trap

- **The Pitfall**: In monorepo CI setups, extensionless or misnamed workflow files (such as `.github/workflows/jmeter` or `.github/workflows/playwright` without `.yml`/`.yaml`) cause silent workflow execution skips or syntax validation errors.
- **Rule**: Every workflow file under `.github/workflows/` must have a valid `.yml` or `.yaml` extension, adhere to standard GitHub Actions schema, and specify a descriptive `name:`.
- **Pre-Push Validation**: Validate workflow syntax locally with `actionlint` or YAML linters before pushing.

---

## 12. Multi-Framework GitHub Pages Namespacing & Concurrency Management

- **Namespaced Publishing**: When multiple automated frameworks publish HTML reports (Playwright Allure, Selenium Allure, WDIO Allure, JMeter HTML dashboards), each stack must publish to an isolated destination directory:
  - Playwright: `destination_dir: AutomationReports/Playwright`
  - JMeter: `destination_dir: AutomationReports/JMeter`
- **Prevent Report Clobbering**:
  - Use `peaceiris/actions-gh-pages@v3` with `keep_files: true` so consecutive deployments do not erase other frameworks' reports.
  - Preserve `history/` directories across builds to maintain trendline graphs in Allure.
- **Concurrency Locks**:
  - Always configure `concurrency: { group: 'github-pages', cancel-in-progress: false }` to queue deployment steps sequentially and prevent Git ref push collisions on `gh-pages`.

---

## 13. Markdown Link Portability Across Environments (GitHub vs. IDE)

- **The Problem**: Using absolute Windows file paths (e.g. `file:///c:/Workspace/AutomationFrameworks/...`) in markdown files breaks across environments:
  - In GitHub web views, clicking gives browser security errors (`Not allowed to load local resource`).
  - In Linux CI runners or other developer workstations, the path does not exist.
- **Strict Rule**:
  - **Always use relative paths** (`../Phases/...`, `../../docs/...`, `../role-sdet-architect/SKILL.md`).
  - Ensure links work equivalently inside IDE previews and on GitHub.com repository browsers.

---

## 14. Fast-Feedback PR Quality Gate vs. Full Regression Gate

- **PR Gate (< 3 minutes)**:
  - Target: Pull requests to `main`.
  - Scope: Parallel `typecheck`, `lint`, Render staging warm-up probe, and high-priority `@smoke` UI + API tests.
  - Purpose: Immediate developer feedback; blocks merges on broken contracts or styling regressions without incurring heavy execution overhead.
- **Post-Merge & Scheduled Regression**:
  - Target: Push to `main`, nightly schedules, or manual `workflow_dispatch`.
  - Scope: Full ~110 Playwright tests, multi-framework E2E runs, Apache JMeter load tests, and Allure report publishing.

---

## 15. Appium 2.x Mobile Automation Ecosystem & Driver Decoupling

- **Driver Decoupling**: Appium 2.x does not bundle drivers. CI environments and developer workstations must install drivers explicitly:
  ```bash
  appium driver install uiautomator2
  appium driver install xcuitest
  ```
- **Screen Object Pattern**:
  - Inherit all screen objects from a unified `BaseMobileScreen.ts`.
  - Never hardcode absolute pixel coordinates for touch interactions; use dynamic percentage-based calculations (`swipeUp(0.8, 0.2)`).
- **Mobile Chaos Resilience**:
  - Author automated tests verifying screen orientation flips (`driver.setOrientation('LANDSCAPE')`), simulated network drops, and app backgrounding/resuming.

---

## 16. Automated Closed-Loop Governance & Parity Auditing

- **Automated Dual-Catalog Parity Validator**:
  - Maintain a zero-tolerance validator in CI:
    ```bash
    git diff --exit-code docs/test_cases_catalog.md playwright-e2e/test_cases_catalog.md
    ```
  - If a PR modifies one catalog without updating the other, CI fails immediately.
- **Quarantine Lifecycle Governance**:
  - Flaky tests must be tagged with `@quarantine` and tracked in the catalogs.
  - A scheduled workflow (`quarantine-audit.yml`) executes quarantined tests 10x in a matrix loop.
  - When a test achieves a 100% pass rate across 3 consecutive audit runs, an automated PR or notification proposes graduation back into the main regression suite.

---

## 17. Monorepo `.gitignore` Negation Precedence in Subdirectories

- **The Pitfall**: In Git, wildcard ignore rules like `.env.*` match files in any subfolder (e.g. `selenium-e2e/.env.example`). However, a negation exception written without a glob prefix (like `!.env.example`) only un-ignores the file at the root repository level!
- **Consequence**: Subproject template files like `selenium-e2e/.env.example` or `playwright-e2e/.env.example` remain silently ignored and blocked by Git.
- **The Rule**: Always pair root negations with recursive glob negation patterns in the root `.gitignore`:
  ```gitignore
  # Ignore real env files in all directories
  .env
  .env.*
  
  # Allow example templates at root and across all subpackages
  !.env.example
  !**/.env.example
  ```
- **Validation**: Always verify with `git check-ignore <filepath>` to guarantee real secrets are ignored while `.env.example` files are tracked.

---

## 18. Playwright Visual Regression Snapshot Resolution & Dynamic Element Settling

- **Snapshot File Resolution**:
  - Playwright's `expect(page).toHaveScreenshot('catalog-baseline.png')` resolves file paths using `{testFileDir}/{testFileName}-snapshots/{arg}-{projectName}-{platform}.png`.
  - When the project name is set to `chrome` (`name: 'chrome'`), Playwright strictly expects `catalog-baseline-chrome-win32.png` on Windows and `catalog-baseline-chrome-linux.png` on Linux CI.
  - Legacy filenames like `catalog-baseline-Google-Chrome-*.png` or `catalog-baseline-chromium-*.png` cause snapshot mismatch errors and must be cleaned up to adhere to the single-browser Chrome policy.
- **Asynchronous Asset Settling vs. DOM Visibility**:
  - Waiting only for element presence (`waitForBookCardSelector()`) is insufficient for visual assertions because images (book covers) and live WebSockets (`#ws-status-dot`) load asynchronously.
  - An unscheduled snapshot captures blank image placeholders and a red disconnected WebSocket dot, triggering an 8% pixel mismatch against settled baselines.
  - **Golden Stabilization Pattern**:
    ```typescript
    await page.goto(envConfig.baseUrl);
    await catalogPage.waitForBookCardSelector();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('catalog-baseline.png', {
      maxDiffPixelRatio: 0.05,
      threshold: 0.2,
      animations: 'disabled',
    });
    ```


