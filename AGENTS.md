# AutomationFrameworks — Agent Knowledge & Engineering Guidelines

This document serves as the **always-on memory and operational baseline** for all AI models and human engineers working on the `AutomationFrameworks` monorepo. It codifies hard-learned lessons, architectural boundaries, and non-negotiable rules to prevent redundant discovery, avoid breaking changes, and conserve tokens.

---

## 🧭 Repository Overview & Tech Stacks

`AutomationFrameworks` is a multi-framework test automation monorepo for the **BuggyBooks** application:
- **`playwright-e2e/`**: Primary E2E and API automation framework (Playwright, TypeScript, Allure, Monocart).
- **`jmeter/`**: Performance and load testing test plans, CSV datasets, and HTML reporting (Apache JMeter 5.6+).
- **`selenium-e2e/`**: TypeScript + Mocha + Chai + Selenium WebDriver.
- **`wdio-e2e/`**: TypeScript + Mocha + WebdriverIO.
- **`.github/workflows/`**: Production CI/CD pipelines (Render warm-up, Allure deployment to GitHub Pages).

---

## ⚡ Core Rules & Non-Negotiables (Must Follow)

### 1. Browser Execution Policy: ONLY Google Chrome UI and API
- **Rule**: **Do NOT introduce multiple browsers** (no Firefox, WebKit, Mobile Safari, Mobile Chrome, or duplicate Chromium).
- **Playwright Projects**: `playwright-e2e/src/config/playwright.config.ts` must contain **only 3 projects**:
  1. `setup`: Runs `src/tests/auth.setup.ts` using `channel: 'chrome'` to cache storage state (`.auth/user.json`).
  2. `api`: Runs `src/tests/api/` (pure HTTP via Playwright `request` context, no browser launched).
  3. `chrome`: Runs `src/tests/ui/` in Google Chrome (`channel: 'chrome'`), dependent on `setup`.
- **Expected Test Count**: Exactly **~110 tests** (55 API tests + 54 Chrome UI tests + 1 auth setup). If you see ~380 tests, redundant multi-browser projects have erroneously leaked back into the config.
- **Setup Project Trap**: `auth.setup.ts` **must** declare `use: { channel: 'chrome' }`. If omitted, Playwright defaults to bundled `chromium_headless_shell` (which is not installed in CI), causing `setup` to crash and all 54 UI tests to skip!

### 2. Render Staging Cold-Start Latency & Pre-Flight Probe
- **Environments**:
  - Frontend: `https://buggy-books-fe.onrender.com`
  - Backend: `https://buggy-books.onrender.com`
- **Render Idle Sleep Quirk**: Free-tier Render instances spin down after ~15 minutes of inactivity. First HTTP response takes 30–60 seconds.
- **Mandatory Pre-Flight Ping**: All CI workflows and local runs targeting staging **must** execute the wake-up probe before tests start:
  ```bash
  curl -s -o /dev/null https://buggy-books.onrender.com/api/books || true
  curl -s -o /dev/null https://buggy-books-fe.onrender.com/ || true
  npx wait-on -t 90000 https://buggy-books.onrender.com/api/books
  npx wait-on -t 90000 https://buggy-books-fe.onrender.com/
  ```
  *Skipping this will cause initial test requests to time out and produce false-positive flakiness.*

### 3. Intentional Chaos Containment & State Reset
- **Chaos Endpoints**:
  - Toggle Chaos: `POST /api/test/config` (e.g. `checkoutFailureRate`, `inventoryDelayMs`)
  - Reset Application State: `POST /api/test/reset`
- **Critical Gotcha**: Chaos settings mutate the **shared staging server** globally.
- **Strict Rule**: Any test altering chaos parameters (e.g. `Test_001_ChaosAndTestingApi.spec.ts`) **must** reset parameters in `test.afterEach`:
  ```ts
  test.afterEach(async ({ request }) => {
    await request.post('/api/test/config', {
      data: { checkoutFailureRate: 0, inventoryDelayMs: 0 }
    });
    await request.post('/api/test/reset');
  });
  ```
  *Failing to reset leaves `checkoutFailureRate: 1.0` active, causing concurrent or subsequent tests (like `API_LOG_04` in `Test_001_LoggingAndCorrelationApi.spec.ts`) to fail with 500 errors.*

### 4. Apache JMeter Performance Architecture
- **Location**: `jmeter/Tests/` and `jmeter/TestData/`
- **Suites**:
  - `BuggyBooks_Catalog_Load.jmx` (`TC-PERF-JM-001`): Catalog browsing, search (`GET /api/books?search=`), book detail (< 3000ms SLA).
  - `BuggyBooks_Auth_Stress.jmx` (`TC-PERF-JM-002`): User registration with `${__UUID}`, login, JSON extractor (`$.token`), `/auth/me`.
  - `BuggyBooks_Ecommerce_Journey.jmx` (`TC-PERF-JM-003`): Stateful customer purchase workflow (Login $\rightarrow$ Browse $\rightarrow$ Cart $\rightarrow$ Order).
  - `BuggyBooks_Inventory_Stress.jmx` (`TC-PERF-JM-004`): Contention stress on `/api/inventory/report` (< 5000ms SLA).
- **CI Workflow**: `.github/workflows/jmeter-performance.yaml` supports on-demand parameterization (`threads`, `ramp_time`, `iterations`) and generates HTML dashboards + Step Summaries.

### 5. Documentation & Dual-Catalog Strict Parity
- **Rule**: Whenever automated tests are added, modified, or removed, **both** catalog files must be updated in 100% lockstep:
  1. `docs/test_cases_catalog.md`
  2. `playwright-e2e/test_cases_catalog.md`
- **Format**: Table entry with `ID` (`TC-...`, `API-...`, `UI-...`), `Title`, `Description`, `Priority`, `Target Coverage`, `Tags`, and `Covered` status (spec path, runner command, assertion thresholds).

### 6. Git Hygiene & PR Conventions
- **Secrets & Storage State**: `.auth/` and `reports/` must remain in `.gitignore`. Never commit session files.
- **Commit Style**: Use conventional commit messages:
  - `feat(scope): ...`
  - `fix(scope): ...`
  - `docs(scope): ...`
- **PR Description**: Every pull request must contain structured sections:
  - `## 📌 Summary of Changes`
  - `## 🧪 Verification` (with actual command output and test counts)

---

## 📖 Deep-Dive Reference
For detailed recipes, code examples, troubleshooting steps, and architectural walkthroughs, consult the dedicated agent skill:
👉 [**`.agents/skills/repo-learnings-and-patterns/SKILL.md`**](file:///.agents/skills/repo-learnings-and-patterns/SKILL.md)
