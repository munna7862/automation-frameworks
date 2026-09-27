# Task Backlog: AutomationFrameworks Sprint Execution

## Current Focus: Sprint 3.1 — BuggyBooks Selenium Page Objects & Auth/Catalog Smoke

**Sprint Identifier**: `SPRINT-3.1-SELENIUM-BUGGYBOOKS-ALIGNMENT`  
**Phase**: Phase 3 (WebdriverIO & Selenium Alignment to BuggyBooks)  
**Story Points**: 5 SP  
**Branch**: `feat/sprint-3.1-selenium-buggybooks-alignment`  
**Goal**: Re-align the `selenium-e2e` framework from legacy mock sites to the BuggyBooks e-commerce platform, creating typed Page Objects (`LoginPage`, `CatalogPage`) and implementing deterministic smoke test specs running on Google Chrome.

---

## 1. Persona Roles & Ownership Matrix

| Persona | Role Assignment | Responsibilities for this Sprint | Status |
| :--- | :--- | :--- | :--- |
| **Scrum Master** | `role-scrum-master` | Sprint planning, `task.md` tracking, DoR verification, and DoD audit. | `ACTIVE` |
| **SDET Architect** | `role-sdet-architect` | Test strategy, dual-catalog sync, POM contracts, and code acceptance review. | `ACTIVE` |
| **Selenium Specialist** | `role-selenium-specialist` | Implementation of Page Objects, test specs, and execution scripts in `selenium-e2e`. | `ACTIVE` |
| **DevOps Engineer** | `role-devops-engineer` | CI/CD workflow updates, Render pre-flight probe, and PR release lifecycle. | `ACTIVE` |
| **Product Owner** | Human Tech Lead (`User`) | Backlog prioritization, sprint kickoff, and final PR review & merge. | `STANDBY` |

---

## 2. Granular Task Breakdown

### US-AF-311: Selenium Environment & Driver Factory Reconfiguration (2 SP)
- [x] **US-AF-311.1** (`SDET Architect`): Verify environment configuration schema and headless Chrome driver options.
- [x] **US-AF-311.2** (`Selenium Specialist`): Update `selenium-e2e/src/config/env.config.ts` targeting BuggyBooks URLs (`https://buggy-books-fe.onrender.com` and `https://buggy-books.onrender.com/api`).
- [x] **US-AF-311.3** (`Selenium Specialist`): Reconfigure `selenium-e2e/src/core/driver.factory.ts` for headless Google Chrome (`--headless=new`, `--disable-gpu`, `--no-sandbox`, `--disable-dev-shm-usage`, `--window-size=1920,1080`).
- [x] **US-AF-311.4** (`Selenium Specialist`): Add explicit auto-waiting methods in `selenium-e2e/src/core/base/base.page.ts` (`waitForVisible`, `waitForClickable`, `ensureNavElementVisible`).
- [x] **US-AF-311.5** (`Selenium Specialist`): Add `typecheck` script to `selenium-e2e/package.json` for monorepo workspace validation.

### US-AF-312: BuggyBooks Page Objects & Smoke Test Implementation (3 SP)
- [x] **US-AF-312.1** (`SDET Architect`): Define `LoginPage` and `CatalogPage` interfaces and update dual test catalogs in 100% lockstep parity (`docs/test_cases_catalog.md` and `playwright-e2e/test_cases_catalog.md`).
- [x] **US-AF-312.2** (`Selenium Specialist`): Author `selenium-e2e/src/pages/LoginPage.ts` with encapsulated BuggyBooks locators and interaction methods.
- [x] **US-AF-312.3** (`Selenium Specialist`): Author `selenium-e2e/src/pages/CatalogPage.ts` with encapsulated BuggyBooks catalog locators and actions.
- [x] **US-AF-312.4** (`Selenium Specialist`): Author `selenium-e2e/src/tests/ui/Test_001_Selenium_Auth.spec.ts` (`TC-SEL-001`) with valid login, invalid login, and logout validation.
- [x] **US-AF-312.5** (`Selenium Specialist`): Author `selenium-e2e/src/tests/ui/Test_002_Selenium_Catalog.spec.ts` (`TC-SEL-002`) with catalog load, book count assertion, and search filtering.
- [x] **US-AF-312.6** (`Selenium Specialist`): Purge obsolete mock pages (`github.page.ts`, `home.page.ts`) and mock tests (`Test_001_VerifyHomePage.spec.ts`, `Test_002_NetworkInterceptor.spec.ts`, `Test_001_BasicCRUD.spec.ts`).
- [x] **US-AF-312.7** (`SDET Architect`): Conduct Code Acceptance Review on Selenium POMs and specs, verifying zero blind sleeps and teardown hygiene.
- [x] **US-AF-312.8** (`Scrum Master`): Verify 4-point DoD checklist (`typecheck`, 100% green execution, dual-catalog zero diff, docs).
- [x] **US-AF-312.9** (`DevOps Engineer`): Validate workflow execution, push branch, open PR via `gh pr create`, and monitor CI checks.

---

## 3. Sprint Review Comments & Refinement Loop

| Gate / Reviewer | Target Role | Review Feedback & Comments | Gate Status |
| :--- | :--- | :--- | :---: |
| **Pre-Flight Architecture Gate** | SDET Architect | Staging pre-flight probe responsive (8s). POM interfaces designed to mirror Playwright locator conventions. Section 24 appended to both catalogs with zero diff. | `[PASSED]` |
| **Code Acceptance Review Gate** | SDET Architect | Single-browser rule (headless Chrome) enforced in `driver.factory.ts`. Zero blind sleeps (`waitForVisible`, `waitForBooksCount` used). Teardown quits driver cleanly. | `[PASSED]` |
| **Scrum Master DoD Gate** | Scrum Master | All 4 DoD points audited: `lint:all` & `typecheck:all` exit 0; 5/5 Selenium smoke specs pass green deterministically; dual-catalog diff exits 0; sprint docs updated. | `[PASSED]` |
| **DevOps Release Gate** | DevOps Engineer | Staging probe and release lifecycle authorized. Branch ready for commit, push, and PR submission. | `[PASSED]` |
| **Final Human Sign-Off** | Human Tech Lead | Final PR review and merge to `main`. | `[PENDING]` |

---

## 4. Definition of Done (DoD) Checklist

- [x] `npm run lint:all` and `npm run typecheck:all` pass across all active workspaces with 0 errors.
- [x] 100% deterministic green execution across authored Selenium test specs (no flaky retries, 5/5 passing).
- [x] Dual-catalog parity confirmed: `git diff --no-index docs/test_cases_catalog.md playwright-e2e/test_cases_catalog.md` exits 0.
- [x] Single-browser execution policy strictly preserved (Google Chrome UI only).
- [x] Obsolete mock tests and Page Objects removed.
- [x] Sprint documentation and `planning/README.md` updated where applicable.
- [x] Pull request opened with structured summary and verification evidence (`gh pr create`).
- [x] All CI workflow checks green, approved, and handed over to Human PO.

---

## 5. Verification & Execution Evidence

```bash
# Command 1: Dual-catalog parity check
git diff --no-index docs/test_cases_catalog.md playwright-e2e/test_cases_catalog.md
# Result: Exit 0 (zero character diff)

# Command 2: Static analysis
npm run lint:all; npm run typecheck:all
# Result: Exit 0 across all 3 workspace packages

# Command 3: Deterministic test execution
npm test --prefix selenium-e2e
# Result: Exit 0 (5/5 specs passing in ~19s on headless Google Chrome)
```
