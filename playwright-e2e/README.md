# Playwright E2E Automation Framework

This repository contains a TypeScript-based Playwright automation framework for the BuggyBooks application. It supports UI, API, and end-to-end user journey validation with structured page objects, reusable fixtures, test data separation, network capture, logging, dynamic glob test discovery, tag-based execution (`@smoke`, `@regression`, `@chaos`, `@a11y`), and Allure reporting.

## Tech Stack

- Playwright Test with TypeScript
- Axios for API automation
- Page Object Model for UI automation
- Custom Playwright fixtures for reusable test setup
- Winston for framework logging (via `@automationframeworks/playwright-utils`)
- Allure Playwright and Monocart for execution reports
- dotenv + Zod-validated environment configuration (via `@automationframeworks/test-data`)

## Application Under Test

| Layer | `ENV=DOCKER` (default)  | `ENV=STAGING` / `INTEROP`              |
| ----- | ----------------------- | -------------------------------------- |
| UI    | `http://localhost:5173` | `https://buggy-books-fe.onrender.com/` |
| API   | `http://localhost:4000` | `https://buggy-books.onrender.com`     |

These values are configurable through environment variables. Start the local Docker stack with `npm run env:up` from the repository root.

## Framework Structure

```text
playwright-e2e/
  playwright.config.ts        # re-exports src/config/playwright.config.ts
  contract-tests/             # Pact consumer & provider verification
  scripts/                    # snapshot, HAR recording, quarantine audit, Monocart merge
  src/
    api/                      # typed API clients, schemas, custom matchers
    config/
      env.config.ts
      global-setup.ts         # Testcontainers autostart (BUGGYBOOKS_AUTOSTART)
      global-teardown.ts
      playwright.config.ts
    core/
      base/                   # base, api, auth, data, security fixtures + failure hook
      network/
        network.interceptor.ts
    pages/                    # page objects extending BasePage from playwright-utils
    test-data/
      api/
      security/
      ui/
    tests/
      auth.setup.ts
      api/
      ui/
    types/
    utils/
      api.util.ts
      auth.util.ts
      delay.ts
      dom-cleaner.ts
  package.json
  tsconfig.json
```

## Key Capabilities

- Dynamic spec discovery (`testMatch: ['**/*.spec.ts']`) traversing UI and API suites.
- Tag-based execution filtering (`@smoke`, `@regression`, `@chaos`, `@a11y`) using Playwright's native `--grep` flag.
- Configurable action timeout architecture (`ELEMENT_TIMEOUT`, defaulting to 15,000ms).
- UI test automation for catalog, cart, checkout, registration, profile upload, and login flows.
- API test automation for books, registration, login, token refresh, inventory, and chaos endpoints.
- End-to-end checkout journey coverage.
- Reusable page actions through `BasePage`.
- Centralized test fixtures from `src/core/base/base.fixture.ts`.
- Test data stored separately as JSON under `src/test-data`.
- Automatic network capture for UI tests using `NetworkInterceptor`.
- Screenshots, videos, traces, and network logs retained on failures.
- HTML and Allure reporting.
- Centralized configuration through `env.config.ts`.

## Prerequisites

Install the following before running the framework:

- Node.js 24 LTS (see the root `.nvmrc`)
- npm
- Google Chrome
- Java Runtime Environment, required only for Allure report generation

## Setup

This package is an npm workspace. Install from the repository root:

```bash
npm ci
npx playwright install chrome   # Google Chrome only; never install other browsers
```

The configured Playwright project uses the local Chrome channel:

```ts
channel: 'chrome';
```

Make sure Google Chrome is installed on the execution machine.

## Environment Configuration

Create a `.env` file inside `playwright-e2e/` when local overrides or credentials are required.

```env
ENV=STAGING
BASE_URL=https://buggy-books-fe.onrender.com/
API_BASE_URL=https://buggy-books.onrender.com
ELEMENT_TIMEOUT=15000
HEADLESS=false
BROWSER=chrome
USER_NAME=your_existing_user
PASSWORD=your_password
```

Configuration is validated by the shared schema in `packages/test-data/src/config/schema.ts` and exposed through `src/config/env.config.ts`.

| Variable               | Purpose                                                 | Default                                   |
| ---------------------- | ------------------------------------------------------- | ----------------------------------------- |
| `ENV`                  | Profile: `DOCKER`, `STAGING`, or `INTEROP`              | `DOCKER`                                  |
| `BASE_URL`             | BuggyBooks UI base URL                                  | Profile URL                               |
| `API_BASE_URL`         | BuggyBooks API origin (no `/api` suffix)                | Profile URL                               |
| `ELEMENT_TIMEOUT`      | Default action and locator timeout in ms                | `15000`                                   |
| `HEADLESS`             | Headless unless set to `false`                          | `true`                                    |
| `BROWSER`              | Browser identifier (Chrome only)                        | `chrome`                                  |
| `USER_NAME`            | Existing user for login and checkout tests              | `admin` (must be set for `STAGING`)       |
| `PASSWORD`             | Password for existing user                              | `password123` (must be set for `STAGING`) |
| `BUGGYBOOKS_AUTOSTART` | Auto-start the Docker stack for local `ENV=DOCKER` runs | unset                                     |

## Running Tests

### Complete Test Suite (Dynamic Discovery)

Run every project (`setup`, `api`, `chrome`): 230 tests in 47 files as of 2026-10-31. Run `npx playwright test --list` for the current count.

```bash
npm test
```

Per-project and tag shortcuts:

```bash
npm run test:smoke        # @smoke, excluding @quarantine
npm run test:api          # api project only
npm run test:e2e:chrome   # chrome UI project only
npm run test:security     # @security
npm run test:contract     # Pact consumer + provider
```

### Tag-Based Execution Filtering

Run only Smoke tests:

```bash
npx playwright test --grep "@smoke" --config=src/config/playwright.config.ts
```

Run only Regression tests:

```bash
npx playwright test --grep "@regression" --config=src/config/playwright.config.ts
```

Run only Chaos & Resilience tests:

```bash
npx playwright test --grep "@chaos" --config=src/config/playwright.config.ts
```

Run only Accessibility (a11y) tests:

```bash
npx playwright test --grep "@a11y" --config=src/config/playwright.config.ts
```

### Specific Spec Execution

Run a specific spec file:

```bash
npx playwright test src/tests/api/BookCatalog/Test_001_BooksApi.spec.ts --config=src/config/playwright.config.ts
```

### Headless & Custom Timeout Execution

```bash
npx cross-env HEADLESS=true ELEMENT_TIMEOUT=20000 npm test
```

On Windows PowerShell:

```powershell
$env:HEADLESS="true"; $env:ELEMENT_TIMEOUT="20000"; npm test
```

## Reports and Artifacts

Playwright HTML report:

```bash
npx playwright show-report
```

Generate and open Allure report:

```bash
npm run report
```

Clean generated reports, logs, and test artifacts:

```bash
npm run clean-reports
```

Generated output:

| Path                        | Description                                                   |
| --------------------------- | ------------------------------------------------------------- |
| `playwright-report/`        | Playwright HTML report (local runs; CI writes `blob-report/`) |
| `allure-results/`           | Raw Allure results                                            |
| `allure-report/`            | Generated Allure report                                       |
| `reports/monocart-report/`  | Monocart single-file HTML report                              |
| `reports/test-artifacts/`   | Screenshots, videos, traces, and attachments                  |
| `test-results/results.json` | JSON reporter output                                          |
| `logs/framework.log`        | Framework execution logs                                      |
| `logs/errors.log`           | Error-level framework logs                                    |

## Network Logging

UI tests that use the custom `test` fixture from `src/core/base/base.fixture.ts` automatically capture API network calls.

The network interceptor runs in `api-only` mode and captures:

- request URL, method, headers, and payload
- response status, headers, and body when available
- failed request details
- duration in milliseconds

Each test attaches a `network-log.json` artifact to the Playwright test output.

## Authentication Support

The framework includes `AuthUtility` for saving and reusing browser authentication state:

- `saveAuthState`
- `createContextWithSavedAuth`
- `authStateExists`
- `clearAuthState`

This enables hybrid API and UI authentication patterns where tests can avoid repeated UI login steps when a saved browser session is appropriate.

The current checkout and login flows read credentials using:

```ts
getLoginCredentials();
```

Credentials come from `USER_NAME` and `PASSWORD` (or `E2E_USER_NAME` / `E2E_USER_PASSWORD`). They default to the seeded `admin` account for `DOCKER` and `INTEROP`, and must be set explicitly for `STAGING`.

## Test Data Strategy

Test data is stored as JSON and grouped by test layer and feature:

```text
src/test-data/
  api/
    BookCatalog/
    CartAndInventory/
    ChaosAndTesting/
    Logging/
    UserManagement/
  security/
  ui/
    A11y/
    BookCatalog/
    Checkout/
    Diagnostic/
    Profile/
    Refresh/
    Styling/
    UserManagement/
    VisualRegression/
    WebSockets/
```

Keep static input data, expected messages, and reusable scenario values in JSON files. Keep test logic and assertions inside spec files.

## Page Object Strategy

Page classes live under `src/pages` and inherit common browser actions and dynamically configured timeouts from `BasePage` (exported by `@automationframeworks/playwright-utils`).

Use page objects for:

- locators
- page-level actions
- reusable UI workflows
- domain-specific UI behavior

Keep assertions in spec files unless the assertion is part of a reusable business operation.

## API Utility Strategy

`src/utils/api.util.ts` provides a reusable Axios wrapper through `makeRequest`.

It supports:

- `GET`, `POST`, `PUT`, `PATCH`, and `DELETE`
- custom headers
- request payloads
- configurable timeout
- response type selection
- structured error responses
- request and response logging

## Coding Standards

- Use Playwright locators and web-first assertions where possible.
- Annotate all test cases with tags (`@smoke`, `@regression`, `@chaos`, `@a11y`).
- Keep tests readable with `test.step` for business-level flow clarity.
- Store test data outside specs.
- Add new page behavior to page objects instead of duplicating locator logic in tests.
- Keep environment-specific values out of source code.
- Prefer stable selectors over text or layout-dependent selectors.
- Use API setup where it improves test speed and reliability.
- Avoid making tests dependent on execution order unless the dependency is explicit and documented.

## Useful Commands

```bash
npm test
npm run report
npm run clean-reports
npx playwright show-report
npx playwright test --debug --config=src/config/playwright.config.ts
npx playwright test --ui --config=src/config/playwright.config.ts
```
