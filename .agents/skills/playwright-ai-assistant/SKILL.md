---
name: playwright-ai-assistant
description: >-
  Uses local DOM scraping, page snapshotting, and failure-capture hooks to automatically write Page Objects, generate E2E test specs, and self-heal locator failures in the Playwright repository.
---

# Playwright AI Assistant Skill

## Overview
This skill guides the agent to autonomously generate Page Objects, write E2E test specs, and self-heal locator failures in the Playwright test suite. It coordinates the built-in CLI snapshot utilities and failure-hook reporting.

---

## Capabilities & Instructions

### 1. Generating Page Object Models (POMs)
When requested to create a Page Object for a page (e.g. catalog or login):
1. **Launch & Capture Snapshot:** Execute the save-snapshot CLI script in the `playwright-e2e` directory:
   - **For public pages:**
     `npm run save-snapshot <url> <page-name>`
   - **For pages requiring interactive actions (SSO, MFA, scroll to load):**
     Instruct the user that interactive mode is launching and wait for them to finish in the headful browser.
2. **Read Cleaned HTML:** Load the captured HTML snapshot from `playwright-e2e/reports/snapshots/<page-name>.html` and the accessibility tree YAML from `playwright-e2e/reports/snapshots/<page-name>.yaml`.
3. **Draft the POM Class:**
   - Extend `BasePage` imported from `../core/base/base.page`.
   - Declare locators as private getters returning `Locator` using `@playwright/test`.
   - Prefer role-based, placeholder, or aria-label selectors first. Falls back to IDs or precise XPaths.
   - Implement public interaction methods using custom `BasePage` wrapper actions (`this.doClick`, `this.doEnterText`, `this.doGetText`, etc.) with meaningful descriptive logs.
4. **Save Page Object:** Write the TypeScript file directly to `playwright-e2e/src/pages/<page-name>.page.ts`.

---

### 2. Generating E2E Test Specs
When requested to write E2E tests:
1. **Analyze Dependencies:** Read and analyze existing page objects in `playwright-e2e/src/pages/` to identify reusable selectors and methods.
2. **Draft the Spec:**
   - Import `test` from `../../../core/base/base.test` (extended custom fixture) and `expect` from `@playwright/test`.
   - Structure tests inside `test.describe` and group steps using `await test.step(...)`.
   - Instantiate Page Objects directly inside the spec or import their registered fixtures.
3. **Save Spec:** Write the file to `playwright-e2e/src/tests/ui/<FeatureName>/<TestName>.spec.ts`.

---

### 3. Self-Healing Broken Tests
When a test fails or when requested to "heal a failure":
1. **Load Failure Context:** Read the generated failure metadata from:
   - `playwright-e2e/reports/snapshots/failure-context.json` (contains the failing locator and error traceback)
   - `playwright-e2e/reports/snapshots/failure-dom.html` (contains the cleaned DOM at failure point)
2. **Diagnose Selector Changes:**
   - Compare the failing locator from `failure-context.json` against the elements inside `failure-dom.html`.
   - Search for updated button text, aria roles, classes, or IDs that represent the target element.
3. **Patch Code:** Automatically locate the corresponding Page Object (or test spec) file and update the broken selector.
4. **Rerun & Verify:** Run the spec using Playwright to confirm the healed test passes:
   `$env:HEADLESS="true"; npx playwright test <TestName>.spec.ts --config=src/config/playwright.config.ts`

---

## Common Pitfalls
* **Direct Playwright Interactions:** Never use native `page.click()` or `locator.fill()`. Always use the `BasePage` logging wrappers (`this.doClick`, `this.doEnterText`).
* **Hardcoded Delays:** Avoid using `page.waitForTimeout()` without reason. Prefer using Playwright's auto-waiting locators or standard page/network load state wait states.
