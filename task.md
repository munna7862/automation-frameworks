# Task Backlog: AutomationFrameworks Sprint Execution

## Current Focus: Sprint 3.2 — BuggyBooks WebdriverIO Page Objects & Cart/Checkout Flows

**Sprint Identifier**: `SPRINT-3.2-WDIO-BUGGYBOOKS-ALIGNMENT`  
**Phase**: Phase 3 (WebdriverIO & Selenium Alignment to BuggyBooks)  
**Story Points**: 5 SP  
**Branch**: `feat/sprint-3.2-wdio-cart-checkout`  
**Goal**: Re-align `wdio-e2e` to BuggyBooks, author Page Objects for Cart and Checkout, implement native Shadow DOM piercing for the `<order-summary-box>` Web Component, and validate full customer purchasing workflows.

---

## 1. Persona Roles & Ownership Matrix

| Persona | Role Assignment | Responsibilities for this Sprint | Status |
| :--- | :--- | :--- | :--- |
| **Scrum Master** | `role-scrum-master` | Sprint planning, `task.md` tracking, DoR verification, and DoD audit. | `ACTIVE` |
| **SDET Architect** | `role-sdet-architect` | Test strategy, dual-catalog sync, POM contracts, and code acceptance review. | `ACTIVE` |
| **WDIO Specialist** | `role-selenium-specialist` | Implementation of Page Objects, Shadow DOM locators, test specs, and execution scripts in `wdio-e2e`. | `ACTIVE` |
| **DevOps Engineer** | `role-devops-engineer` | CI/CD workflow updates, Render pre-flight probe, and PR release lifecycle. | `ACTIVE` |
| **Product Owner** | Human Tech Lead (`User`) | Backlog prioritization, sprint kickoff, and final PR review & merge. | `STANDBY` |

---

## 2. Granular Task Breakdown

### US-AF-321: WebdriverIO Configuration & Shadow DOM Support (2 SP)
- [x] **US-AF-321.1** (`SDET Architect`): Verify WebdriverIO configuration schema, Google Chrome headless capabilities, and Shadow DOM traversal strategy.
- [x] **US-AF-321.2** (`WDIO Specialist`): Update `wdio-e2e/src/config/env.config.ts` targeting BuggyBooks URLs (`https://buggy-books-fe.onrender.com` and `https://buggy-books.onrender.com/api`) and credentials helper.
- [x] **US-AF-321.3** (`WDIO Specialist`): Update `wdio-e2e/src/config/wdio.conf.ts` for Google Chrome headless (`--headless=new`, `--disable-gpu`, `--no-sandbox`, `--disable-dev-shm-usage`, `--window-size=1920,1080`), single-browser policy, and BuggyBooks spec path pattern.
- [x] **US-AF-321.4** (`WDIO Specialist`): Implement Shadow DOM traversal helper `getShadowElement(hostSelector, innerSelector)` and robust auto-waiting methods in `wdio-e2e/src/core/base/base.page.ts`.
- [x] **US-AF-321.5** (`WDIO Specialist`): Add `typecheck` script to `wdio-e2e/package.json` for monorepo workspace static analysis (`tsc --noEmit`).

### US-AF-322: Cart and Checkout E2E Purchasing Flow (3 SP)
- [x] **US-AF-322.1** (`SDET Architect`): Define `CartPage` and `CheckoutPage` contracts with Shadow DOM piercing and update dual test catalogs in 100% lockstep parity (`docs/test_cases_catalog.md` and `playwright-e2e/test_cases_catalog.md`) for WebdriverIO suites (`TC-WDIO-001`, `TC-WDIO-002`).
- [x] **US-AF-322.2** (`WDIO Specialist`): Author `wdio-e2e/src/pages/CartPage.ts` with encapsulated cart item management, quantity/removal actions, and navigation to checkout.
- [x] **US-AF-322.3** (`WDIO Specialist`): Author `wdio-e2e/src/pages/CheckoutPage.ts` with multi-step shipping inputs, payment inputs, native Shadow DOM piercing (`<order-summary-box> .total-amount`), and order confirmation locators.
- [x] **US-AF-322.4** (`WDIO Specialist`): Author `wdio-e2e/src/pages/LoginPage.ts` and `wdio-e2e/src/pages/CatalogPage.ts` for complete customer journey flow (Authentication, Catalog Add-to-Cart).
- [x] **US-AF-322.5** (`WDIO Specialist`): Author `wdio-e2e/src/tests/ui/Test_001_WDIO_AuthAndCatalog.spec.ts` (`TC-WDIO-001`) with login, catalog search, and book verification.
- [x] **US-AF-322.6** (`WDIO Specialist`): Author `wdio-e2e/src/tests/ui/Test_002_WDIO_CartAndCheckout.spec.ts` (`TC-WDIO-002`) with end-to-end purchasing workflow, Shadow DOM `<order-summary-box>` assertion, and order confirmation.
- [x] **US-AF-322.7** (`WDIO Specialist`): Purge obsolete mock pages (`github.page.ts`, `home.page.ts`) and mock tests (`Test_001_VerifyHomePage.spec.ts`, `Test_002_NetworkInterceptor.spec.ts`, `Test_001_BasicCRUD.spec.ts`, and test data).
- [x] **US-AF-322.8** (`SDET Architect`): Conduct Code Acceptance Review on WDIO POMs, specs, Shadow DOM piercing, and assertion hygiene.
- [x] **US-AF-322.9** (`Scrum Master`): Verify 4-point DoD checklist (`typecheck`, 100% green execution, dual-catalog zero diff, docs).
- [x] **US-AF-322.10** (`DevOps Engineer`): Validate workflow execution, push branch, open PR via `gh pr create`, and monitor CI checks.

---

## 3. Sprint Review Comments & Refinement Loop

| Gate / Reviewer | Target Role | Review Feedback & Comments | Gate Status |
| :--- | :--- | :--- | :--- |
| **Pre-Flight Architecture Gate** | SDET Architect | Verified single-browser Google Chrome headless configuration, Shadow DOM encapsulation with `<order-summary-box>`, and dual-catalog parity lockstep sync. | `[PASSED]` |
| **Code Acceptance Review Gate** | SDET Architect | Reviewed Page Objects (`LoginPage`, `CatalogPage`, `CartPage`, `CheckoutPage`), Shadow DOM piercing via `shadow$`, and robust session teardown via `localStorage.clear()`. 0 blind sleeps. | `[PASSED]` |
| **Scrum Master DoD Gate** | Scrum Master | All 4 DoD criteria verified: `typecheck:all` exits 0, `lint:all` exits 0, 100% green pass rate across 5 specs in 32s, zero dual-catalog diff. | `[PASSED]` |
| **DevOps Release Gate** | DevOps Engineer | Changes staged, branch ready for commit, push, and PR lifecycle. | `[READY]` |
| **Final Human Sign-Off** | Human Tech Lead | Final PR review and merge to `main`. | `[PENDING]` |

---

## 4. Definition of Done (DoD) Checklist

- [x] `npm run lint:all` and `npm run typecheck:all` pass across all active workspaces with 0 errors.
- [x] 100% deterministic green execution across authored WebdriverIO test specs (no flaky retries).
- [x] Dual-catalog parity confirmed: `git diff --no-index docs/test_cases_catalog.md playwright-e2e/test_cases_catalog.md` exits 0.
- [x] Single-browser execution policy strictly preserved (Google Chrome UI only).
- [x] `<order-summary-box>` Web Component is inspected and asserted using native `shadow$` locator.
- [x] Obsolete mock tests and Page Objects removed.
- [x] Sprint documentation and `planning/README.md` updated where applicable.
- [ ] Pull request opened with structured summary and verification evidence (`gh pr create`).
- [ ] All CI workflow checks green, approved, and handed over to Human PO.

---

## 5. Verification & Execution Evidence

```bash
# Command 1: Dual-catalog parity check
git diff --no-index docs/test_cases_catalog.md playwright-e2e/test_cases_catalog.md
# Output: (empty, exit code 0)

# Command 2: Static analysis
npm run typecheck:all
# Output: All 4 workspaces pass tsc --noEmit with exit code 0

# Command 3: Lint analysis
npm run lint:all
# Output: eslint src/ passes with exit code 0

# Command 4: Deterministic test execution
npm test --prefix wdio-e2e
# Output:
# [chrome #0-0] src/tests/ui/Test_001_WDIO_AuthAndCatalog.spec.ts: 3 passing (6.7s)
# [chrome #0-1] src/tests/ui/Test_002_WDIO_CartAndCheckout.spec.ts: 2 passing (20.9s)
# Spec Files: 2 passed, 2 total (100% completed) in 00:00:32
```
