## WebdriverIO E2E Framework

This framework is the WebdriverIO migration target for `playwright-e2e`. It runs BuggyBooks UI specs on Google Chrome only (AGENTS.md §1).

### Run Tests

Install once from the repository root (`npm ci`), then from `wdio-e2e/`:

```bash
npm test               # ENV=DOCKER by default (http://localhost:5173); run "npm run env:up" from the root first
npm run test:smoke     # @smoke specs only
npm run test:interop   # ENVIRONMENT=INTEROP (Render staging)
```

### Useful Environment Variables

The environment is validated by the shared schema in `packages/test-data/src/config/schema.ts`. See the root [README](../README.md#environment-variables) for the full list.

- `ENV` / `ENVIRONMENT` selects the profile (`DOCKER`, `STAGING`, `INTEROP`).
- `HEADLESS=false` runs the browser headed (headless is the default).
- `SUITENAME=<suite-name>` loads `src/tests/TestSuites/<suite-name>.json` (a `testFiles` array) instead of the default spec glob.

### Reports

Allure results are written to `wdio-e2e/allure-results`; `npm run report` generates `allure-report/` and opens it.

```bash
npm run report
npm run clean-reports
```
