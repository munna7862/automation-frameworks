---
description: "Create or migrate Playwright API tests with repo-specific auth, status assertion, and contract validation conventions"
name: "Create Playwright API Test"
argument-hint: "API scenario, endpoint env var key, and target spec path"
agent: "playwright-api-tester"
model: "GPT-5 (copilot)"
---
Create or migrate an API test in Playwright.

Inputs:
- Scenario: <endpoint + HTTP method + expected behavior>
- Endpoint env var key: <e.g. process.env.CALENDAR, process.env.ACTIONITEM>
- Environment: <INTEROP | QA | PSR>
- Target spec path: <playwright-e2e/src/tests/api/.../YourApiTest.spec.ts>

Requirements:
- Read `playwright-e2e/src/utils/api.util.ts` and adjacent API tests before writing any code.
- Obtain auth token via `ApiUtil.getBearerToken()` in `beforeAll`; never hardcode credentials.
- Use numeric success statuses (200/201) and string error statuses ("400"/"401"/"404"/"409"/"500").
- Assert response body contract for success cases — verify required fields and types.
- Include at least one negative test case with status + error body assertion.
- If UI interactions are needed (e.g., setup via UI), use page object methods — never inline selectors in API tests.
- Clean up any created test data in `afterAll`.
- Keep function and method parameters on a single line (do not format one parameter per line), and use 2-space indentation (spaces: 2, no tabs).
- Run focused validation with `--workers=1` and summarize changed files and results.
