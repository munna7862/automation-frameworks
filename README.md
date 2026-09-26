# AutomationFrameworks — Enterprise Multi-Framework Test Automation Monorepo

`AutomationFrameworks` is a state-of-the-art multi-framework test automation monorepo testing the **BuggyBooks** e-commerce platform ([Frontend](https://buggy-books-fe.onrender.com) | [Backend](https://buggy-books.onrender.com/api)). It serves as a premier comparative and reusable SDET workspace where diverse automation stacks validate the identical application across Web, Mobile, API, and Performance disciplines.

---

## 🏛️ Strategic Engineering Planning & Delivery Roadmap

The monorepo follows a structured 5-Phase, 15-Sprint execution lifecycle driven by a specialized 6-agent virtual persona team:
- 📖 [**Master Plan (`planning/Master/master_plan.md`)**](planning/Master/master_plan.md)
- 🗺️ [**Planning & Sprint Sitemap (`planning/README.md`)**](planning/README.md)
- 📋 [**Test Cases Catalog (`docs/test_cases_catalog.md`)**](docs/test_cases_catalog.md)
- 🧠 [**Always-On Agent Memory (`AGENTS.md`)**](AGENTS.md)
- 🛠️ [**Repository Learnings Playbook (`.agents/skills/repo-learnings-and-patterns/SKILL.md`)**](.agents/skills/repo-learnings-and-patterns/SKILL.md)

---

## 🧭 Multi-Framework Architecture

| Framework / Package | Technology Stack | Scope & Status |
| :--- | :--- | :--- |
| **`playwright-e2e`** | Playwright, TypeScript, Allure | **Primary Web & API**: Strictly Google Chrome (`channel: 'chrome'`) and headless API (~110 tests). |
| **`packages/playwright-utils`**| `@automationframeworks/playwright-utils` | Shared BasePage, Winston loggers, and typed assertion helpers. |
| **`selenium-e2e`** | Selenium WebDriver, TypeScript, Mocha, Chai | W3C compliant E2E web automation on Google Chrome with WebDriverWait & Shadow DOM piercing. |
| **`wdio-e2e`** | WebdriverIO, TypeScript, Mocha, Allure | Modern WebdriverIO web automation targeting BuggyBooks with `shadow$` selectors. |
| **`mobile-automation`** | Appium 2.x, WebdriverIO | Android (`UiAutomator2`) & iOS (`XCUITest`) Screen Objects & mobile chaos resilience. |
| **`jmeter`** | Apache JMeter 5.6+ | Enterprise stress, high-concurrency load, and HTML reporting dashboards. |
| **`k6-performance`** | k6 (JavaScript) | Fast PR baseline drift regression gates (`<= 20%` drift threshold). |

---

## ⚡ Non-Negotiable Operational Baseline

1. **Browser Execution Policy**: All web suites execute strictly on **Google Chrome** (`channel: 'chrome'` or Chrome headless). Multi-browser configs (`firefox`, `webkit`, `safari`) are forbidden.
2. **Render Staging Pre-Flight Warm-Up**: Free-tier Render instances sleep when idle. Always wake instances before test runs:
   ```bash
   npx wait-on -t 90000 https://buggy-books.onrender.com/api/books
   npx wait-on -t 90000 https://buggy-books-fe.onrender.com/
   ```
3. **Intentional Chaos Containment**: Any test toggling chaos knobs via `POST /api/test/config` must restore defaults via `POST /api/test/reset` in `afterEach`.
4. **Dual-Catalog Parity**: Both `docs/test_cases_catalog.md` and `playwright-e2e/test_cases_catalog.md` must remain 100% synchronized.


## Playwright E2E

The Playwright framework is the main automation implementation for the BuggyBooks application. It includes UI, API, checkout journey, network capture, Allure reports, and structured page objects.

```bash
cd playwright-e2e
npm install
npx playwright install
npm test
```

Useful commands:

```bash
npm run report
npm run clean-reports
npx playwright show-report
```

More details: [playwright-e2e/README.md](./playwright-e2e/README.md)

## Selenium E2E

The Selenium framework uses TypeScript, Mocha, Chai, Selenium WebDriver, Axios, Winston logging, and Allure reporting.

```bash
cd selenium-e2e
npm install
npm test
```

Useful commands:

```bash
npm run report
npm run clean-reports
```

## WebdriverIO E2E

The WebdriverIO framework is a migration-style implementation aligned with the same automation architecture ideas used in the Playwright project.

```bash
cd wdio-e2e
npm install
npm test
```

Run the INTEROP profile:

```bash
npm run test:interop
```

Useful commands:

```bash
npm run report
npm run clean-reports
```

More details: [wdio-e2e/README.md](./wdio-e2e/README.md)

## JMeter Performance Tests

The JMeter project contains performance test plans, parameterized CSV datasets, and automated reporting configurations for BuggyBooks API benchmarks and legacy CRUD tests.

```text
jmeter/
  Tests/
    BuggyBooks_Catalog_Load.jmx
    BuggyBooks_Auth_Stress.jmx
    BuggyBooks_Ecommerce_Journey.jmx
    BuggyBooks_Inventory_Stress.jmx
    CRUDPerformanceTest.jmx
  TestData/
    catalog_search.csv
    users.csv
    UserId.csv
  Results/
```

Run headlessly from a machine with Apache JMeter 5.6+ installed:

```bash
# BuggyBooks Catalog Load Test
jmeter -n -t jmeter/Tests/BuggyBooks_Catalog_Load.jmx -l jmeter/Results/catalog_report.jtl -e -o jmeter/Results/html-dashboard

# BuggyBooks Auth Stress Test
jmeter -n -t jmeter/Tests/BuggyBooks_Auth_Stress.jmx -l jmeter/Results/auth_report.jtl

# BuggyBooks Full E-Commerce Journey
jmeter -n -t jmeter/Tests/BuggyBooks_Ecommerce_Journey.jmx -l jmeter/Results/journey_report.jtl
```

More details: [jmeter/README.md](./jmeter/README.md)

## Common Prerequisites

- Node.js 18 or higher
- npm
- Google Chrome or another supported browser
- Java Runtime Environment for Allure and JMeter
- Apache JMeter for performance test execution

## Environment Variables

Environment handling is framework-specific. Common variables used across projects include:

| Variable | Purpose |
| --- | --- |
| `ENV` or `ENVIRONMENT` | Logical environment name |
| `BASE_URL` | UI application base URL |
| `API_BASE_URL` | API application base URL |
| `POSTS_BASE_URL` | JSONPlaceholder API base URL used by sample API tests |
| `HEADLESS` | Runs browser tests in headless mode when set to `true` |
| `BROWSER` | Browser selection, such as `chrome`, `firefox`, or `edge` |
| `SUITENAME` | Optional suite file selector |
| `USER_NAME` | Login user for authenticated tests |
| `PASSWORD` | Login password for authenticated tests |

Create a `.env` file inside the framework directory when local overrides are needed.

## Reporting

Each Node-based framework writes reports in its own project directory.

| Framework | Report Command | Output |
| --- | --- | --- |
| Playwright | `npm run report` | `playwright-e2e/reports/allure-report` |
| Selenium | `npm run report` | `selenium-e2e/allure-report` |
| WebdriverIO | `npm run report` | `wdio-e2e/reports/allure-report` |
| JMeter | JMeter CLI or GUI | `jmeter/Results` |

## CI/CD

GitHub Actions workflows are stored under `.github/workflows`.

Current workflow coverage includes:

- Playwright CI execution
- Playwright Docker execution
- Sharded Playwright execution variants
- BuggyBooks JMeter performance test workflows (`jmeter-performance.yaml`)
- Legacy JMeter CRUD performance workflow (`jmeter.yml`)

## Engineering Principles

- Keep each framework independently runnable.
- Keep source, test data, logs, and reports separated.
- Prefer page objects for UI behavior reuse.
- Prefer utilities for API, logging, configuration, and shared technical concerns.
- Keep environment-specific values outside source code.
- Generate enough artifacts to debug failures quickly.
- Use CI workflows to validate repeatability outside the local machine.

## Recommended Workflow

1. Choose the framework that matches the validation goal.
2. Install dependencies inside that framework folder.
3. Configure environment variables or `.env` values.
4. Run tests locally.
5. Review logs, screenshots, traces, and Allure reports.
6. Push changes and let GitHub Actions validate the same flow in CI.

## Notes for Contributors

- Do not commit generated reports, logs, screenshots, traces, or local secrets.
- Keep framework-specific dependencies inside the relevant project folder.
- Update the project README when adding commands, new environment variables, or major framework capabilities.
- Keep test data readable and close to the feature or layer it supports.
- Prefer small, focused tests with clear setup, action, and assertion phases.
