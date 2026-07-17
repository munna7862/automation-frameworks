# User Guide: Automated E2E Testing with AI (Zero API Keys)

This guide provides a step-by-step walkthrough of how to use the newly implemented AI utilities in this repository to generate Page Objects, write E2E tests, and auto-heal failing tests using your IDE's built-in AI assistant (**Antigravity**) or free chat models (like VSCode Copilot or ChatGPT).

---

## Architecture Components

1. **DOM Scraper & ARIA snapshotter:** Extracts a simplified, token-efficient view of any web page.
2. **Snapshot CLI Utility:** Captures web pages in headless, authenticated, or interactive modes.
3. **AI Guidelines:** Custom rules in `docs/AI_POM_GUIDELINES.md` that align generated code with project conventions.
4. **Post-Failure Hook:** Captures page state at the exact moment of test failures for self-healing.

---

## Workflow 1: Creating a Page Object Model (POM)

Follow these steps to create a Page Object for a page (e.g. the checkout page):

### Step 1: Capture the Page Snapshot
Run the snapshot CLI utility to scrape the page's structure. Pick the command matching the target page type:

* **For Public/Static Pages:**
  ```bash
  npm run save-snapshot https://buggy-books-fe.onrender.com/checkout checkout
  ```
* **For Pages requiring Custom Delays (waiting for APIs/polling to settle):**
  ```bash
  npm run save-snapshot https://buggy-books-fe.onrender.com/checkout checkout -- --wait 3000
  ```
* **For Authenticated Views (SSO, Multi-Factor Login, or Infinite Scroll):**
  Use the **interactive mode** flag. It opens a visual browser window, lets you login or scroll manually, and waits for your confirmation:
  ```bash
  npm run save-snapshot https://buggy-books-fe.onrender.com/profile profile -- --interactive
  ```
  *Press `Enter` in your terminal when you are ready to capture the snapshot.*

### Step 2: Open Chat with Antigravity
Open the chat interface in your IDE and request POM generation:

> **Prompt Example:**
> *"Antigravity, please write a Page Object class for the checkout page using the local snapshot file `playwright-e2e/reports/snapshots/checkout.html`. Make sure it follows our project's coding standards in `docs/AI_POM_GUIDELINES.md`."*

### Step 3: Review and Save
Antigravity will read the cleaned HTML snapshot, identify all form inputs, buttons, and text fields, and output a completed TypeScript class:
* It will define private getters for element locators.
* It will wrap actions inside custom logging wrappers (`this.doClick`, `this.doEnterText`, etc.).
* Save the file under `playwright-e2e/src/pages/<page-name>.page.ts`.

---

## Workflow 2: Generating E2E Test Specs

Once your Page Objects are ready, you can have AI write the E2E tests for you:

### Step 1: Ask Antigravity to Write the Spec
Open the chat window and write your test requirements:

> **Prompt Example:**
> *"Write a Playwright test spec for completing a book purchase. Use `src/pages/checkout.page.ts` and `src/pages/catalog.page.ts` to perform the actions. Structure the steps using `test.step` and use our custom logging wrappers."*

### Step 2: Save the Spec
* Save the resulting code under `playwright-e2e/src/tests/ui/<FeatureName>/<TestName>.spec.ts`.
* Run the test locally to verify execution:
  ```bash
  $env:HEADLESS="true"; npx playwright test <TestName>.spec.ts --config=src/config/playwright.config.ts
  ```

---

## Workflow 3: Auto-Healing a Broken Test

If a test fails due to a selector change (e.g. an element ID or class name changed in a UI update), the test runner will automatically capture diagnostics.

### Step 1: Execute the Tests
When you run a test and it fails, the **Failure Hook** interceptor automatically outputs three diagnostics files:
1. `reports/snapshots/failure-context.json` (Failing selector, stack trace, target URL, and error message)
2. `reports/snapshots/failure-dom.html` (Pruned DOM snapshot at the moment of failure)
3. `reports/snapshots/failure-aria.yaml` (Accessibility tree snapshot at the moment of failure)

### Step 2: Ask Antigravity to Heal the Test
In the chat interface, paste the following instruction:

> **Prompt Example:**
> *"Antigravity, my test failed. Please check `reports/snapshots/failure-context.json` and `reports/snapshots/failure-dom.html` and heal the broken locators in the corresponding Page Object or test spec."*

### Step 3: Review and Run
* Antigravity will examine the error context, identify the broken selector, match it against the updated HTML DOM snapshot, edit the code files, and replace the selector.
* Run the test suite again to verify it is fully resolved!
