# AutomationFrameworks — Enterprise Multi-Framework Test Automation Monorepo

`AutomationFrameworks` is a state-of-the-art multi-framework test automation monorepo testing the **BuggyBooks** e-commerce platform ([Frontend](https://buggy-books-fe.onrender.com) | [Backend](https://buggy-books.onrender.com/api)). It serves as a premier comparative and reusable SDET workspace where diverse automation stacks validate the identical application across Web, Mobile, API, and Performance disciplines.

---

## 🏛️ Strategic Engineering Planning & Delivery Roadmap

The monorepo follows a structured 5-Phase, 15-Sprint execution lifecycle (Phases 1–5, complete), extended by Roadmap v2 (Phases 6–12), and driven by a specialized 8-persona virtual agent team:

- 📖 [**Master Plan (`planning/Master/master_plan.md`)**](planning/Master/master_plan.md)
- 🧭 [**Enhancement Roadmap v2 (`planning/Master/enhancement_roadmap_v2.md`)**](planning/Master/enhancement_roadmap_v2.md)
- 🗺️ [**Planning & Sprint Sitemap (`planning/README.md`)**](planning/README.md)
- 📋 [**Test Cases Catalog (`docs/test_cases_catalog.md`)**](docs/test_cases_catalog.md)
- 🚀 [**Developer Onboarding & Quick Start (`docs/onboarding.md`)**](docs/onboarding.md)
- 🧠 [**Always-On Agent Memory (`AGENTS.md`)**](AGENTS.md)
- 🛠️ [**Repository Learnings Playbook (`.agents/skills/repo-learnings-and-patterns/SKILL.md`)**](.agents/skills/repo-learnings-and-patterns/SKILL.md)

---

## 🚀 Quick Start & Zero-to-Green Onboarding

Get from clone to a passing PR-grade test run in **under 10 minutes**! See the complete [**Developer Onboarding Guide (`docs/onboarding.md`)**](docs/onboarding.md).

### 1. Choose Your Environment

- **GitHub Codespaces (Zero Install)**: Launch directly from GitHub (**Code** ➔ **Codespaces** ➔ **New codespace**). Uses our batteries-included Dev Container with Chrome, Java, JMeter, k6, Allure, and Task. _Personal accounts receive 60 hours/month free allowance._
- **Local Dev Container**: Open in VS Code and select **Reopen in Container** (requires Docker Desktop).
- **Bare-Metal Host**: Install Node 24 LTS, Google Chrome stable, Docker, Java 17+, and run `npm ci`.

### 2. Run the PR Verification Workflow

Using [go-task](https://taskfile.dev) (installed in dev container) or root npm scripts:

```bash
# 1. Start ephemeral BuggyBooks containers (backend :4000, frontend :5173)
task env:up          # or: npm run env:up

# 2. Run PR quality gate (lint, typecheck, catalog parity, Chrome smoke tests)
task test:pr         # or: npm run test:pr (the task variant also runs the Prettier format check)

# 3. Tear down and purge containers
task env:down        # or: npm run env:down
```

### 3. On-Demand Testcontainers Mode

For automated local spec runs without manual compose commands, Playwright automatically spins up and tears down ephemeral BuggyBooks containers:

```bash
cd playwright-e2e
npx cross-env ENV=DOCKER BUGGYBOOKS_AUTOSTART=true npx playwright test --grep @smoke
```

_(Requires Docker Desktop running locally. Automatically reuses existing stack if ports 4000/5173 already respond. Autostart is disabled when `CI` is set)._

---

## 🧭 Multi-Framework Architecture

| Framework / Package             | Technology Stack                            | Scope & Status                                                                                                                                |
| :------------------------------ | :------------------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------- |
| **`playwright-e2e`**            | Playwright, TypeScript, Allure              | **Primary Web & API**: Strictly Google Chrome (`channel: 'chrome'`) and headless API (229 tests across 3 projects).                           |
| **`packages/playwright-utils`** | `@automationframeworks/playwright-utils`    | Shared BasePage, Winston loggers, and typed assertion helpers.                                                                                |
| **`packages/test-data`**        | `@automationframeworks/test-data`           | Shared data factories, builders, API seeders, cleanup registry, and Zod configuration schema.                                                 |
| **`selenium-e2e`**              | Selenium WebDriver, TypeScript, Mocha, Chai | W3C compliant E2E web automation on Google Chrome with WebDriverWait & Shadow DOM piercing.                                                   |
| **`wdio-e2e`**                  | WebdriverIO, TypeScript, Mocha, Allure      | Modern WebdriverIO web automation targeting BuggyBooks with `shadow$` selectors.                                                              |
| **`mobile-automation`**         | Appium 3.x, WebdriverIO                     | Android (`UiAutomator2`) & iOS (`XCUITest`) Screen Objects. **Quarantined**: no BuggyBooks mobile app build exists yet (see `mobile-ci.yml`). |
| **`jmeter`**                    | Apache JMeter 5.6+                          | Enterprise stress, high-concurrency load, and HTML reporting dashboards.                                                                      |
| **`k6-performance`**            | k6 (JavaScript)                             | Fast PR baseline drift regression gates (`<= 20%` drift threshold).                                                                           |

---

## ⚡ Non-Negotiable Operational Baseline

1. **Browser Execution Policy**: All web suites execute strictly on **Google Chrome** (`channel: 'chrome'` or Chrome headless). Multi-browser configs (`firefox`, `webkit`, `safari`) are forbidden.
2. **Render Staging Pre-Flight Warm-Up**: Free-tier Render instances sleep when idle. Always wake instances before test runs against `ENV=STAGING`:
   ```bash
   npx wait-on -t 90000 https://buggy-books.onrender.com/api/books
   npx wait-on -t 90000 https://buggy-books-fe.onrender.com/
   ```
   _(Local and PR runs default to hermetic `ENV=DOCKER` to bypass cold-starts completely)._
3. **Intentional Chaos Containment**: Any test toggling chaos knobs via `POST /api/test/config` must restore defaults via `POST /api/test/reset` in `afterEach`.
4. **Dual-Catalog Parity**: Both `docs/test_cases_catalog.md` and `playwright-e2e/test_cases_catalog.md` must remain 100% synchronized.

## Playwright E2E

The Playwright framework is the main automation implementation for the BuggyBooks application. It includes UI, API, checkout journey, network capture, Allure and Monocart reports, and structured page objects.

This is an npm workspaces monorepo: install once from the repository root, then run framework scripts from the framework folder (or with `--workspace=<name>` from the root).

```bash
npm ci                          # from the repo root
npx playwright install chrome   # Google Chrome only (AGENTS.md §1)
cd playwright-e2e
npm test                        # setup + api + chrome projects
npm run test:smoke              # @smoke only, excluding @quarantine
npm run test:api                # API project only
npm run test:e2e:chrome         # Chrome UI project only
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
npm test             # runs with ENVIRONMENT=INTEROP (Render staging)
npm run test:smoke
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
npm test             # defaults to ENV=DOCKER (localhost)
npm run test:smoke
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
  Legacy/
    CRUDPerformanceTest.jmx
  TestData/
    catalog_search.csv
    users.csv
    UserId.csv
  Results/
```

Run headlessly from a machine with Apache JMeter 5.6+ installed. The plans default to Render staging (`-Jhost=buggy-books.onrender.com -Jprotocol=https`), so warm it up first (see the baseline below). Pass the CSV dataset as an absolute path, as CI does:

```bash
cd jmeter

# BuggyBooks Catalog Load Test (with HTML dashboard)
jmeter -n -t Tests/BuggyBooks_Catalog_Load.jmx -l Results/catalog_report.jtl -e -o Reports/catalog-report -JCSV_FILE="$PWD/TestData/catalog_search.csv"

# BuggyBooks Auth Stress Test
jmeter -n -t Tests/BuggyBooks_Auth_Stress.jmx -l Results/auth_report.jtl -JCSV_FILE="$PWD/TestData/users.csv"

# BuggyBooks Full E-Commerce Journey
jmeter -n -t Tests/BuggyBooks_Ecommerce_Journey.jmx -l Results/journey_report.jtl -JCSV_FILE="$PWD/TestData/users.csv"
```

More details: [jmeter/README.md](./jmeter/README.md)

## Common Prerequisites

- Node.js 24 LTS (or version specified in `.nvmrc`)
- npm
- Google Chrome (single-browser policy strictly enforced per AGENTS.md §1)
- Java Runtime Environment (JRE 17+) for Allure and JMeter
- Apache JMeter 5.6+ for performance test execution

## Environment Variables

Playwright, Selenium, and WebdriverIO all validate their environment through the shared Zod schema in `packages/test-data/src/config/schema.ts`. Common variables:

| Variable                             | Purpose                                                                                         | Default                           |
| ------------------------------------ | ----------------------------------------------------------------------------------------------- | --------------------------------- |
| `TARGET_ENV` / `ENV` / `ENVIRONMENT` | Environment profile: `DOCKER` (localhost), `STAGING` or `INTEROP` (Render). First one set wins. | `DOCKER`                          |
| `BASE_URL` (or `E2E_BASE_URL`)       | UI base URL. Overrides the profile value.                                                       | Profile (`http://localhost:5173`) |
| `API_BASE_URL` (or `E2E_API_URL`)    | API origin without `/api` (a trailing `/api` is stripped). Overrides the profile value.         | Profile (`http://localhost:4000`) |
| `HEADLESS`                           | Runs browser in headless mode unless set to `false`                                             | `true`                            |
| `BROWSER`                            | Browser identifier (`chrome` strictly enforced; see AGENTS.md §1)                               | `chrome`                          |
| `ELEMENT_TIMEOUT`                    | Default action and locator timeout in ms                                                        | `15000`                           |
| `SUITENAME`                          | Optional suite label used in reports                                                            | `Default`                         |
| `USER_NAME` (or `E2E_USER_NAME`)     | Login user for authenticated tests. **Required** for `STAGING`.                                 | `admin` (non-STAGING)             |
| `PASSWORD` (or `E2E_USER_PASSWORD`)  | Login password for authenticated tests. **Required** for `STAGING`.                             | `password123` (non-STAGING)       |
| `BUGGYBOOKS_AUTOSTART`               | Playwright only: start the Docker stack automatically for local `ENV=DOCKER` runs               | unset                             |

See [`.env.example`](.env.example) for a template. Create a `.env` file inside the framework directory when local overrides are needed.

## Reporting

Each Node-based framework writes reports in its own project directory.

| Framework   | Report Command    | Output                                                                                         |
| ----------- | ----------------- | ---------------------------------------------------------------------------------------------- |
| Playwright  | `npm run report`  | `playwright-e2e/allure-report` (Monocart: `playwright-e2e/reports/monocart-report/index.html`) |
| Selenium    | `npm run report`  | `selenium-e2e/allure-report`                                                                   |
| WebdriverIO | `npm run report`  | `wdio-e2e/allure-report`                                                                       |
| JMeter      | JMeter CLI or GUI | `jmeter/Results` (`.jtl`), `jmeter/Reports` (HTML dashboards)                                  |

## CI/CD Architecture & Workflows

GitHub Actions workflows are maintained under `.github/workflows/` and powered by composite actions under `.github/actions/`. See [CI Pipeline Architecture Map](docs/architecture/ci_pipeline_map.md) for full architectural blueprints, contracts, and migration history.

### Active Workflows

| Workflow                              | Path                                                                                     | Trigger                                           | Purpose                                                                                                                                                  |
| :------------------------------------ | :--------------------------------------------------------------------------------------- | :------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **PR Quality Gate**                   | [`.github/workflows/pr-gate.yml`](.github/workflows/pr-gate.yml)                         | `pull_request [main]`                             | Lint, typecheck, Prettier, catalog parity, OpenAPI drift, commitlint, Chrome UI + API smoke against ephemeral `ENV=DOCKER`, 5x burn-in of changed specs. |
| **Reusable E2E Pipeline**             | [`.github/workflows/_reusable-e2e.yml`](.github/workflows/_reusable-e2e.yml)             | `workflow_call`                                   | Core execution engine for Playwright (sharded), Selenium, and WDIO with Allure and Monocart reporting.                                                   |
| **Playwright CI**                     | [`.github/workflows/playwright-ci.yml`](.github/workflows/playwright-ci.yml)             | `push [main]` (path-filtered), dispatch           | Thin caller invoking `_reusable-e2e.yml` with 4 native shards (configurable on dispatch).                                                                |
| **Selenium CI**                       | [`.github/workflows/selenium-ci.yml`](.github/workflows/selenium-ci.yml)                 | `push [main]` (path-filtered), dispatch           | Thin caller invoking `_reusable-e2e.yml` for Selenium WebDriver.                                                                                         |
| **WebdriverIO CI**                    | [`.github/workflows/wdio-ci.yml`](.github/workflows/wdio-ci.yml)                         | `push [main]` (path-filtered), dispatch           | Thin caller invoking `_reusable-e2e.yml` for WebdriverIO.                                                                                                |
| **Nightly Regression**                | [`.github/workflows/nightly-regression.yml`](.github/workflows/nightly-regression.yml)   | Cron `30 1 * * *` (01:30 UTC), dispatch           | Parallel execution of Playwright (4 shards), Selenium, and WDIO with consolidated matrix summary; includes the `STAGING` contract job.                   |
| **Contract Tests**                    | [`.github/workflows/contract-tests.yml`](.github/workflows/contract-tests.yml)           | `pull_request` (path-filtered), cron, dispatch    | Pact consumer/provider contract verification. See [contract testing](docs/contract_testing.md).                                                          |
| **API Fuzz**                          | [`.github/workflows/api-fuzz.yml`](.github/workflows/api-fuzz.yml)                       | Cron `0 3 * * *`, dispatch                        | Schemathesis property-based fuzzing of the OpenAPI operations against ephemeral Docker.                                                                  |
| **JMeter Performance**                | [`.github/workflows/jmeter-performance.yaml`](.github/workflows/jmeter-performance.yaml) | `workflow_dispatch`                               | Parameterized Apache JMeter load tests with HTML dashboard reporting.                                                                                    |
| **k6 Performance**                    | [`.github/workflows/k6-performance.yaml`](.github/workflows/k6-performance.yaml)         | `pull_request` (path-filtered), dispatch          | Developer k6 benchmark with automated baseline drift regression gate.                                                                                    |
| **Mobile CI**                         | [`.github/workflows/mobile-ci.yml`](.github/workflows/mobile-ci.yml)                     | `workflow_dispatch` only (quarantined)            | Appium Android emulator run on `ubuntu-latest`. Nightly schedule disabled until a BuggyBooks mobile app build exists.                                    |
| **Quarantine Audit**                  | [`.github/workflows/quarantine-audit.yml`](.github/workflows/quarantine-audit.yml)       | Cron `0 2 * * 1` (Mon), dispatch                  | 10x repetition stability audit for quarantined tests.                                                                                                    |
| **Security: DAST**                    | [`.github/workflows/security-dast.yml`](.github/workflows/security-dast.yml)             | `pull_request` (path-filtered), nightly cron      | OWASP ZAP baseline and API scans against ephemeral Docker. See [security testing guide](docs/security/security_testing_guide.md).                        |
| **Security: CodeQL / Deps / Secrets** | `security-codeql.yml`, `security-deps.yml`, `security-secrets.yml`                       | push/PR to `main` (+ weekly cron for CodeQL/deps) | Static analysis, dependency vulnerability scanning, and secret detection. See [repo security controls](docs/security/repo_security_controls.md).         |
| **Lint Workflows**                    | [`.github/workflows/lint-workflows.yml`](.github/workflows/lint-workflows.yml)           | push/PR to `main`, dispatch                       | `actionlint` and `zizmor` audits of the GitHub Actions workflows.                                                                                        |
| **Release**                           | [`.github/workflows/release.yml`](.github/workflows/release.yml)                         | `push [main]`, dispatch                           | Release Please versioning and `CHANGELOG.md` updates.                                                                                                    |

### Shared Composite Actions

- **`setup-monorepo`** ([`.github/actions/setup-monorepo`](.github/actions/setup-monorepo/action.yml)): Node.js 24 LTS via `.nvmrc`, npm caching, and Chrome browser caching.
- **`buggybooks-up`** ([`.github/actions/buggybooks-up`](.github/actions/buggybooks-up/action.yml)): Starts the ephemeral GHCR BuggyBooks stack (`infra/docker-compose.test.yml`) and waits for health.
- **`buggybooks-down`** ([`.github/actions/buggybooks-down`](.github/actions/buggybooks-down/action.yml)): Captures container logs as an artifact and tears the stack down.
- **`staging-warmup`** ([`.github/actions/staging-warmup`](.github/actions/staging-warmup/action.yml)): Render staging pre-flight wake-up probe with `wait-on` (`STAGING` runs only).
- **`chaos-reset`** ([`.github/actions/chaos-reset`](.github/actions/chaos-reset/action.yml)): Reset chaos parameters and restore stock baseline for catalog books.

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
