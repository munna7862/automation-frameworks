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
  1. [`docs/test_cases_catalog.md`](file:///c:/Workspace/AutomationFrameworks/docs/test_cases_catalog.md)
  2. [`playwright-e2e/test_cases_catalog.md`](file:///c:/Workspace/AutomationFrameworks/playwright-e2e/test_cases_catalog.md)
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
   - `npm run typecheck` inside `playwright-e2e/` (must exit 0).
   - `npm run lint` inside `playwright-e2e/` (must exit 0).
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
