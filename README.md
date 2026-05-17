# AutomationFrameworks

AutomationFrameworks is a multi-framework test automation monorepo containing UI, API, end-to-end, and performance testing assets. It is structured as a comparative and reusable SDET workspace where different automation stacks can validate similar engineering patterns: page objects, reusable utilities, environment configuration, reporting, logging, and CI execution.

## Repository Structure

```text
AutomationFrameworks/
  .github/
    agents/
    prompts/
    workflows/
  jmeter/
    Results/
    TestData/
    Tests/
  playwright-e2e/
  selenium-e2e/
  wdio-e2e/
  .gitignore
```

## Frameworks

| Project | Purpose | Stack |
| --- | --- | --- |
| `playwright-e2e` | Primary UI, API, and E2E framework for BuggyBooks | Playwright, TypeScript, Axios, Allure |
| `selenium-e2e` | Selenium-based UI and API automation framework | Selenium WebDriver, TypeScript, Mocha, Chai, Allure |
| `wdio-e2e` | WebdriverIO-based UI and API automation framework | WebdriverIO, TypeScript, Mocha, Allure |
| `jmeter` | Performance test assets | Apache JMeter |
| `.github` | CI workflows, reusable prompts, and SDET automation agents | GitHub Actions, prompt assets |

## Quick Start

Clone the repository and install dependencies inside the framework you want to run.

```bash
git clone <repository-url>
cd AutomationFrameworks
```

Each test framework is intentionally self-contained. Run `npm install` inside the selected project folder rather than at the monorepo root.

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

The JMeter project contains performance test plans, test data, and sample result output.

```text
jmeter/
  Tests/CRUDPerformanceTest.jmx
  TestData/UserId.csv
  Results/output.jtl
```

Run from a machine with Apache JMeter installed:

```bash
jmeter -n -t jmeter/Tests/CRUDPerformanceTest.jmx -l jmeter/Results/output.jtl
```

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
- JMeter CRUD performance workflow

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
