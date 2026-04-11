## WebdriverIO E2E Framework

This framework is the WebdriverIO migration target for `playwright-e2e`.

### Run Tests

```bash
npm install
npm run test:interop
```

### Useful Environment Variables

- `HEADLESS=true` runs the browser headlessly.
- `BROWSER=chrome|firefox|edge` selects the browser capability.
- `POSTS_BASE_URL` overrides the JSONPlaceholder API base URL.
- `SUITENAME=<suite-name>` can load a JSON suite from `src/tests/TestSuites`.

### Reports

Allure results are written to `reports/allure-results`.

```bash
npm run report
```
