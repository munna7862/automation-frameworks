# AutomationFrameworks

[![PR Quality Gate](https://github.com/munna7862/automation-frameworks/actions/workflows/pr-gate.yml/badge.svg)](https://github.com/munna7862/automation-frameworks/actions/workflows/pr-gate.yml)
[![Playwright CI](https://github.com/munna7862/automation-frameworks/actions/workflows/playwright-ci.yml/badge.svg)](https://github.com/munna7862/automation-frameworks/actions/workflows/playwright-ci.yml)
[![CodeQL](https://github.com/munna7862/automation-frameworks/actions/workflows/security-codeql.yml/badge.svg)](https://github.com/munna7862/automation-frameworks/actions/workflows/security-codeql.yml)

A test automation monorepo that tests one application, [BuggyBooks](https://github.com/munna7862/buggy-books), with several stacks side by side: Playwright (UI and API), Selenium WebDriver, WebdriverIO, Appium, k6 and JMeter. BuggyBooks is a deliberately buggy bookshop built for test practice, so the suites also cover its intentional defects and chaos switches.

- Test report (Allure, GitHub Pages): https://munna7862.github.io/automation-frameworks/
- BuggyBooks staging: [frontend](https://buggy-books-fe.onrender.com) and [API](https://buggy-books.onrender.com/api/books) (Render free tier, sleeps when idle)

## Status

Monorepo version **1.1.0** (Release Please, see [CHANGELOG.md](CHANGELOG.md)).

- Roadmap v1, Phases 1-5 (15 sprints, 63 SP): complete.
- Roadmap v2, Phases 6-12: Phases 6-9 and Sprint 10.1 are done (CI integrity and supply-chain security, hermetic Docker environments and test data, typed API clients and contract tests, DAST and AppSec tests). Sprints 10.2-12.3 (accessibility and Web Vitals, Selenium/WDIO parity, k6 and JMeter maturity, observability, test analytics) are not started.
- The Appium mobile suite is quarantined: no BuggyBooks mobile build exists yet, so `mobile-ci.yml` runs on manual dispatch only.

Plans: [planning/README.md](planning/README.md), [master plan](planning/Master/master_plan.md), [roadmap v2](planning/Master/enhancement_roadmap_v2.md).

## Frameworks

| Folder                       | Stack                                       | What it covers                                                                                                                 |
| ---------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `playwright-e2e/`            | Playwright, TypeScript, Allure, Monocart    | Main suite: 230 tests in 3 projects (1 auth setup, 167 API, 62 UI in Google Chrome), plus Pact contract tests and AppSec tests |
| `selenium-e2e/`              | Selenium WebDriver, TypeScript, Mocha, Chai | UI tests in Chrome, including Shadow DOM                                                                                       |
| `wdio-e2e/`                  | WebdriverIO, TypeScript, Mocha, Allure      | UI tests in Chrome using `shadow$` selectors                                                                                   |
| `mobile-automation/`         | Appium 3, WebdriverIO                       | Android (UiAutomator2) and iOS (XCUITest) screen objects; quarantined                                                          |
| `k6-performance/`            | k6                                          | PR performance baseline with a 20% drift gate                                                                                  |
| `jmeter/`                    | Apache JMeter 5.6+                          | Catalog load, auth stress, e-commerce journey and inventory stress plans with HTML dashboards                                  |
| `packages/playwright-utils/` | `@automationframeworks/playwright-utils`    | Shared base page, logger and assertion helpers                                                                                 |
| `packages/test-data/`        | `@automationframeworks/test-data`           | Data factories, API seeders, cleanup registry, Zod config schema                                                               |

All browser tests run in Google Chrome only. This is a project rule (see [AGENTS.md](AGENTS.md)).

## Quick start

Requirements: Node.js 24 (`.nvmrc`), Google Chrome, Docker. Java 17+ is needed for Allure and JMeter. A dev container (`.devcontainer/`) with Chrome, Java, JMeter, k6, Allure and Task is also provided, and works in GitHub Codespaces.

```bash
npm ci
npx playwright install chrome

npm run env:up      # BuggyBooks in Docker: API on :4000, frontend on :5173
npm run test:pr     # lint, typecheck, catalog parity, Chrome smoke tests
npm run env:down
```

The same steps exist as [go-task](https://taskfile.dev) targets: `task env:up`, `task test:pr` (also runs the Prettier check), `task env:down`. Playwright can also start and stop the Docker stack itself:

```bash
cd playwright-e2e
npx cross-env ENV=DOCKER BUGGYBOOKS_AUTOSTART=true npx playwright test --grep @smoke
```

See [docs/onboarding.md](docs/onboarding.md) for the full walkthrough.

## Running each suite

It is an npm workspaces monorepo: install once at the root, then run scripts inside a framework folder or with `--workspace=<name>`.

```bash
# Playwright
cd playwright-e2e
npm test                 # setup + api + chrome projects
npm run test:smoke       # @smoke, excluding @quarantine
npm run test:api
npm run test:e2e:chrome

# Selenium and WebdriverIO
cd selenium-e2e && npm test        # INTEROP profile (Render staging)
cd wdio-e2e && npm test            # DOCKER profile (localhost); npm run test:interop for staging

# From the root against the Docker stack
npm run test:pw
npm run test:selenium
npm run test:wdio
npm run test:contract              # Pact consumer and provider
npm run perf:smoke                 # k6
npm run perf:jmeter                # JMeter catalog load against localhost
```

JMeter plans default to Render staging. Pass the dataset as an absolute path:

```bash
cd jmeter
jmeter -n -t Tests/BuggyBooks_Catalog_Load.jmx -l Results/catalog_report.jtl -e -o Reports/catalog-report -JCSV_FILE="$PWD/TestData/catalog_search.csv"
```

Details per framework: [playwright-e2e](playwright-e2e/README.md), [wdio-e2e](wdio-e2e/README.md), [jmeter](jmeter/README.md).

## Environments

| Profile               | Frontend                              | API                                | Used by                                                                                         |
| --------------------- | ------------------------------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------- |
| `DOCKER` (default)    | `http://localhost:5173`               | `http://localhost:4000`            | Local runs and the PR gate, using BuggyBooks images from GHCR (`infra/docker-compose.test.yml`) |
| `STAGING` / `INTEROP` | `https://buggy-books-fe.onrender.com` | `https://buggy-books.onrender.com` | Nightly staging contract checks, Selenium default                                               |

Render's free tier sleeps after about 15 minutes idle and the first request can take 30-60 seconds. Wake it before a staging run:

```bash
npx wait-on -t 90000 https://buggy-books.onrender.com/api/books
npx wait-on -t 90000 https://buggy-books-fe.onrender.com/
```

All frameworks validate their environment through one Zod schema (`packages/test-data/src/config/schema.ts`). Main variables:

| Variable                                   | Purpose                                                        | Default                                 |
| ------------------------------------------ | -------------------------------------------------------------- | --------------------------------------- |
| `TARGET_ENV` / `ENV` / `ENVIRONMENT`       | Profile: `DOCKER`, `STAGING` or `INTEROP` (first one set wins) | `DOCKER`                                |
| `BASE_URL` / `E2E_BASE_URL`                | UI base URL override                                           | from profile                            |
| `API_BASE_URL` / `E2E_API_URL`             | API origin override, without `/api`                            | from profile                            |
| `USER_NAME`, `PASSWORD`                    | Login for authenticated tests; required for `STAGING`          | `admin` / `password123` outside staging |
| `HEADLESS`, `ELEMENT_TIMEOUT`, `SUITENAME` | Headless mode, locator timeout (ms), report label              | `true`, `15000`, `Default`              |
| `BUGGYBOOKS_AUTOSTART`                     | Playwright only: start the Docker stack for local runs         | unset                                   |

Template: [.env.example](.env.example).

## Reports

| Framework   | Command          | Output                                                                                          |
| ----------- | ---------------- | ----------------------------------------------------------------------------------------------- |
| Playwright  | `npm run report` | `playwright-e2e/allure-report`, Monocart at `playwright-e2e/reports/monocart-report/index.html` |
| Selenium    | `npm run report` | `selenium-e2e/allure-report`                                                                    |
| WebdriverIO | `npm run report` | `wdio-e2e/allure-report`                                                                        |
| JMeter      | JMeter CLI       | `jmeter/Results` (`.jtl`) and `jmeter/Reports` (HTML)                                           |

CI publishes the combined Allure report to [GitHub Pages](https://munna7862.github.io/automation-frameworks/).

## CI

Workflows live in `.github/workflows/` and share composite actions in `.github/actions/` (`setup-monorepo`, `buggybooks-up`, `buggybooks-down`, `staging-warmup`, `chaos-reset`). The full map is in [docs/architecture/ci_pipeline_map.md](docs/architecture/ci_pipeline_map.md).

| Workflow                                                           | Trigger                                        | What it does                                                                                                                              |
| ------------------------------------------------------------------ | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `pr-gate.yml`                                                      | pull request to `main`                         | Lint, typecheck, Prettier, catalog parity, OpenAPI drift, commitlint, Chrome UI and API smoke against Docker, 5x burn-in of changed specs |
| `_reusable-e2e.yml`                                                | called by others                               | Runs Playwright (sharded), Selenium or WDIO with Allure and Monocart reports                                                              |
| `playwright-ci.yml`, `selenium-ci.yml`, `wdio-ci.yml`              | push to `main` (path filtered), manual         | Callers of the reusable pipeline; Playwright uses 4 shards                                                                                |
| `nightly-regression.yml`                                           | daily 01:30 UTC, manual                        | All three UI frameworks plus the `STAGING` contract job                                                                                   |
| `contract-tests.yml`                                               | pull request (path filtered), schedule, manual | Pact consumer and provider verification                                                                                                   |
| `api-fuzz.yml`                                                     | daily, manual                                  | Schemathesis fuzzing of the OpenAPI operations against Docker                                                                             |
| `k6-performance.yaml`                                              | pull request (path filtered), manual           | k6 run with baseline drift gate                                                                                                           |
| `jmeter-performance.yaml`                                          | manual                                         | JMeter plans with thread, ramp and iteration inputs and HTML dashboards                                                                   |
| `quarantine-audit.yml`                                             | weekly, manual                                 | Runs quarantined tests 10 times to decide release or removal                                                                              |
| `security-dast.yml`                                                | pull request (path filtered), nightly          | OWASP ZAP baseline and API scans against Docker                                                                                           |
| `security-codeql.yml`, `security-deps.yml`, `security-secrets.yml` | push and pull request to `main`, weekly        | CodeQL, dependency scanning, secret detection                                                                                             |
| `lint-workflows.yml`                                               | push and pull request to `main`                | `actionlint` and `zizmor` on the workflows                                                                                                |
| `mobile-ci.yml`                                                    | manual only                                    | Appium Android emulator run (quarantined)                                                                                                 |
| `release.yml`                                                      | push to `main`                                 | Release Please versioning and changelog                                                                                                   |

## Project rules

- Chrome is the only browser. Playwright has exactly three projects: `setup`, `api`, `chrome`.
- Tests that change chaos settings (`POST /api/test/config`) must reset them with `POST /api/test/reset` in `afterEach`.
- `docs/test_cases_catalog.md` and `playwright-e2e/test_cases_catalog.md` must stay identical; `npm run test:verify-catalog` enforces it in the PR gate.
- Quarantined tests have a 14-day limit ([quarantine lifecycle guide](docs/quarantine_lifecycle_guide.md)).
- Conventional commits, enforced by commitlint.

The intentional bugs in BuggyBooks and how each framework handles them are documented in [docs/intentional_bugs.md](docs/intentional_bugs.md).

## Repository layout

```
playwright-e2e/  selenium-e2e/  wdio-e2e/  mobile-automation/  k6-performance/  jmeter/
packages/            shared Playwright utilities and test data
infra/               Docker Compose for the BuggyBooks test stack
docs/                onboarding, API and contract testing, security, architecture, test catalogue
planning/            master plan, roadmap v2, phases and sprints
scripts/, tools/     catalog sync, OpenAPI generation, Allure and portal helpers, AI tooling
security/            ZAP rules and contexts
.devcontainer/, Taskfile.yml
```

Contributor and agent guidance: [AGENTS.md](AGENTS.md).
