---
description: "Heal failing or flaky Playwright tests — covers hard failures, selector drift, timing issues, and intermittent CI/Sauce flakiness"
name: "Heal Playwright Test"
argument-hint: "Failing spec path, failure details, and environment"
agent: "playwright-healer"
model: "GPT-5 (copilot)"
---
Heal a failing or flaky Playwright test in this repository.

Inputs:
- Failing spec path: <playwright-e2e/src/tests/.../YourTest.spec.ts>
- Failure details: <error output, symptom, or intermittent pattern>
- Environment: <local | CI | Sauce>
- Failure mode: <consistent failure | intermittent / flaky>

Requirements:
- Classify root cause first: selector drift | timing/race condition | assertion mismatch | environment issue.
- **Locator Hierarchy Rule (CRITICAL)**:
	- Prefer role-based: `page.getByRole('button', { name: 'Submit' })`
	- Fall back to data-testid: `page.locator('[data-testid=\"control\"]')`
	- Use getByLabel/Placeholder/Text when appropriate
	- **NEVER use XPath** — replace any XPath selectors with role-based or data-testid equivalents.
- **Page Object Encapsulation**: 
	- If the broken selector is in a page object, fix it there and update the public method signature if needed.
	- Tests MUST NOT contain inline locators — if a test has `page.locator()` inline, move it to page object immediately.
	- Never patch raw selectors directly in test files; fix them in the page object.
- Fixture/util escalation: if the root cause is in `configs/fixtures.ts` or `util/test.util.ts`, flag it before patching — it affects all specs in the same file-worker cache scope.
- For flaky/intermittent failures: replace static waits with locator/state conditions; check CI vs local timing differences.
- For hard failures: fix selector (with locator hierarchy rule) or assertion root cause directly.
- Keep function and method parameters on a single line (do not format one parameter per line), and use 2-space indentation (spaces: 2, no tabs).
- Preserve test intent and expected behavior.
- Run targeted validation and summarize root cause, fix location, fix applied, and confidence level.
