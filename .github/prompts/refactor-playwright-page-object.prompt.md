---
description: "Refactor or extend Playwright page objects safely with mandatory usages search and backward-compat enforcement"
name: "Refactor Playwright Page Object"
argument-hint: "Page object path and required interaction changes"
agent: "playwright-pom-maintainer"
model: "GPT-5 (copilot)"
---
Refactor or extend a Playwright page object.

Inputs:
- Page object path: <playwright-e2e/src/pages/...>
- Required changes: <new methods, locator updates, or refactor goals>

Requirements:
- **Before any edit**: search for all callers of every method being changed. List them explicitly.
- If a method has more than one caller, keep its existing signature and add a new method instead.
- **Locator Strategy (MANDATORY)**:
	- Prefer role-based: `page.getByRole('button', { name: 'Submit' })`
	- Fall back to data-testid: `page.locator('[data-testid=\"control\"]')`
	- Use getByLabel/Placeholder/Text when appropriate
	- **NEVER use XPath** — unmaintainable and slow.
	- All locators must be private getters in the page object.
- Keep function and method parameters on a single line (do not format one parameter per line), and use 2-space indentation (spaces: 2, no tabs).
- Update only the tests directly impacted by the change.
- Verify all locators are encapsulated in the page object (never exposed inline in tests).
- Run focused validation and summarize methods changed, callers updated, and selector improvements.
