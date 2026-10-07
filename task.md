# Task Backlog: AutomationFrameworks Sprint Execution

## Current Focus: Sprint 10.2 — Accessibility, Web Vitals & Visual Hardening

**Sprint Identifier**: `SPRINT-10.2-A11Y-WEB-VITALS-VISUAL`  
**Phase**: Phase 10 (UI Quality — Determinism, Accessibility, Web Vitals & Framework Parity)  
**Story Points**: 5 SP  
**Branch**: `feat/sprint-10.2-a11y-webvitals`  
**Goal**: Expand accessibility coverage to every page and key state, add Core Web Vitals budgets and Lighthouse CI in Google Chrome, offer an optional Chrome viewport matrix, and make visual baselines environment-independent.

---

## 1. Persona Roles & Ownership Matrix

| Persona                  | Role Assignment              | Responsibilities for this Sprint                                                                                                                                | Status    |
| :----------------------- | :--------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------- |
| **Scrum Master**         | `role-scrum-master`          | Sprint planning, `task.md` governance, DoR verification, DoD audit, and velocity tracking.                                                                      | `ACTIVE`  |
| **SDET Architect**       | `role-sdet-architect`        | WCAG mapping, Core Web Vitals budget contracts, dual-catalog sync, Code Acceptance Review, Quality Gate.                                                        | `ACTIVE`  |
| **Playwright QA Lead**   | `role-playwright-automation` | `a11y.fixture.ts`, A11y scans across all pages & states, `Test_012_KeyboardNavigation.spec.ts`, Web Vitals fixture & tests, responsive suite, visual hardening. | `ACTIVE`  |
| **Performance Engineer** | `role-performance-engineer`  | Web Vitals budget thresholds (`perf-budgets.json`), CDP metrics validation, Lighthouse CI configuration (`lighthouserc.json`).                                  | `ACTIVE`  |
| **DevOps Engineer**      | `role-devops-engineer`       | Lighthouse CI workflow job, portal trend artifact ingestion, PR release lifecycle.                                                                              | `ACTIVE`  |
| **Product Owner**        | Human Tech Lead (`User`)     | Backlog prioritization, review gate approvals, final PR merge to `main`.                                                                                        | `STANDBY` |

---

## 2. Granular Task Breakdown

### US-AF-1021: Accessibility Expansion (1.5 SP)

- [x] **US-AF-1021.1** (`Playwright QA Lead`): Create `playwright-e2e/src/core/a11y/a11y.fixture.ts` implementing `a11y.scan(name, options)` wrapping `@axe-core/playwright` with tags `['wcag2a','wcag2aa','wcag21aa','wcag22aa']`, Allure JSON attachment, failing only on `critical`/`serious` violations, and persisting `a11y-summary.json`.
- [x] **US-AF-1021.2** (`Playwright QA Lead`): Expand A11y test coverage across key pages and states: login, register, catalog, search results, book detail, cart (empty + filled), checkout steps (1, 2, 3 + validation errors), order confirmation, profile, order history, chaos dashboard, notification center open, modals.
- [x] **US-AF-1021.3** (`Playwright QA Lead`): Author `playwright-e2e/src/tests/ui/A11y/Test_012_KeyboardNavigation.spec.ts` executing end-to-end user journey using keyboard only (`Tab`, `Shift+Tab`, `Enter`, `Space`), asserting focus indicators, logical tab order, and modal focus trapping.
- [x] **US-AF-1021.4** (`SDET Architect`): Register `UI-A11Y-*` test cases in both `docs/test_cases_catalog.md` and `playwright-e2e/test_cases_catalog.md` in 100% lockstep parity.

### US-AF-1022: Core Web Vitals Fixture & Budgets (1.5 SP)

- [x] **US-AF-1022.1** (`Playwright QA Lead` & `Performance Engineer`): Create `playwright-e2e/src/config/perf-budgets.json` with thresholds: LCP <= 2500ms, CLS <= 0.1, INP <= 200ms, TTFB <= 800ms.
- [x] **US-AF-1022.2** (`Playwright QA Lead`): Create `playwright-e2e/src/core/perf/web-vitals.fixture.ts` injecting `web-vitals` library (`onLCP`, `onCLS`, `onINP`, `onFCP`, `onTTFB`) into `window.__vitals`, collecting Chrome CDP `Performance.getMetrics` (JS heap, layout count), computing median of 3 runs, and attaching results table to Allure.
- [x] **US-AF-1022.3** (`Playwright QA Lead`): Author `playwright-e2e/src/tests/ui/Performance/Test_001_CoreWebVitalsBudgets.spec.ts` (`@perf-ui`) measuring catalog, book detail, cart, and checkout step 1. Assert CLS exceeds budget under `visualChaos: true` and reset chaos in `afterEach`. Include degraded network profile (Slow 4G CDP emulation) variant.
- [x] **US-AF-1022.4** (`SDET Architect`): Register `UI-PERF-*` test cases in both catalogs in lockstep parity.

### US-AF-1023: Lighthouse CI on Google Chrome (1 SP)

- [x] **US-AF-1023.1** (`Performance Engineer`): Author `lighthouserc.json` at monorepo root targeting catalog, book detail, and cart on Google Chrome (`collect.settings.chromePath`) with assertions: performance >= 0.8, accessibility >= 0.95, best-practices >= 0.9, seo >= 0.8 (warn).
- [x] **US-AF-1023.2** (`DevOps Engineer`): Add `lighthouse` job in `.github/workflows/pr-gate.yml` running Lighthouse CI with Google Chrome when UI pages/specs change, uploading reports for GitHub Pages portal.

### US-AF-1024: Optional Chrome Viewport Matrix (0.5 SP)

- [x] **US-AF-1024.1** (`Playwright QA Lead`): Author `playwright-e2e/src/tests/ui/Responsive/Test_001_ResponsiveLayouts.spec.ts` (`@responsive`) iterating viewports `[{w:1440,h:900},{w:1024,h:768},{w:390,h:844}]` using `test.use({ viewport })` inside describe blocks, asserting nav collapses, no horizontal scroll, and critical CTA visibility.
- [x] **US-AF-1024.2** (`SDET Architect`): Update `AGENTS.md` §1 stating: "Viewport variation inside the chrome project is allowed; new device/browser projects are not."
- [x] **US-AF-1024.3** (`SDET Architect`): Register `UI-RESP-*` test cases in both catalogs in lockstep parity.

### US-AF-1025: Visual Hardening & Environment Independence (0.5 SP)

- [x] **US-AF-1025.1** (`Playwright QA Lead`): Add `visual:update` script in `playwright-e2e/package.json` utilizing Docker container `mcr.microsoft.com/playwright:v1.58.0-jammy`.
- [x] **US-AF-1025.2** (`Playwright QA Lead`): Delete `catalog-baseline-chrome-win32.png`. Configure platform-independent snapshot template or clean skip message on non-Linux environments.
- [x] **US-AF-1025.3** (`Playwright QA Lead`): Add component-level snapshots (book card, cart summary, Shadow DOM `<order-summary-box>`) with dynamic region masking (prices, timestamps, avatars).
- [x] **US-AF-1025.4** (`SDET Architect`): Register `UI-VIS-*` test cases in both catalogs in lockstep parity.

### US-AF-1026: Review, DoD Audit & Release Lifecycle

- [x] **US-AF-1026.1** (`SDET Architect`): Conduct Code Acceptance Review against Sprint 10.2 Code Review Checklist.
- [x] **US-AF-1026.2** (`Scrum Master`): Validate Definition of Done (DoD) criteria, verify `docs/architecture/reporting_architecture.md` updates, verify catalog sync (`npm run test:verify-catalog`).
- [/] **US-AF-1026.3** (`DevOps Engineer`): Commit changes, push branch `feat/sprint-10.2-a11y-webvitals`, open PR with `gh pr create`, monitor CI checks.

---

## 3. Sprint Review Comments & Refinement Loop

| Gate / Reviewer                  | Target Role     | Review Feedback & Comments                                                                                 |   Gate Status   |
| :------------------------------- | :-------------- | :--------------------------------------------------------------------------------------------------------- | :-------------: |
| **Pre-Flight Architecture Gate** | SDET Architect  | Verify test design, Core Web Vitals contracts, Lighthouse config, and dual-catalog parity.                 |   `[PASSED]`    |
| **Code Acceptance Review Gate**  | SDET Architect  | Verify single-browser rule (Chrome only), 0 blind timeouts, teardown state reset, Axe and Vitals fixtures. |   `[PASSED]`    |
| **Scrum Master DoD Gate**        | Scrum Master    | Audit lint, typecheck, 100% green pass rate, and catalog diff.                                             |   `[PASSED]`    |
| **DevOps Release Gate**          | DevOps Engineer | Validate CI workflows, PR creation, and green CI status.                                                   | `[IN_PROGRESS]` |
| **Final Human Sign-Off**         | Human Tech Lead | Final PR review and merge to `main`.                                                                       |   `[PENDING]`   |

---

## 4. Definition of Done (DoD) Checklist

- [x] `npm run lint:all` and `npm run typecheck:all` pass across all workspaces with 0 errors.
- [x] Single-browser execution policy strictly preserved (Google Chrome UI + API only, 3 projects).
- [x] All new specs execute cleanly; budgets met or deviations documented.
- [x] Dual-catalog parity confirmed: `npm run test:verify-catalog` exits 0 with zero diff.
- [x] `docs/architecture/reporting_architecture.md` mentions a11y and vitals artifacts (`a11y-summary.json`, Web Vitals, Lighthouse).
- [x] Teardown state reset probe (`POST /api/test/reset`) verified in all chaos tests.
- [x] Sprint documentation updated (`sprint_10_2_accessibility_web_vitals_and_visual_hardening.md`, `planning/README.md`, `planning/Phases/phase_10_*.md`).
- [/] Pull request opened with structured summary and verification evidence (`gh pr create`).
- [ ] All CI workflow checks green.

---

## 5. Verification & Execution Evidence

```bash
# 1. Dual-catalog verification (327 test cases):
npm run test:verify-catalog # PASS (100% character-for-character identical, exit 0)

# 2. Static analysis:
npm run lint:all      # PASS (0 errors across all workspaces, exit 0)
npm run typecheck:all # PASS (0 errors across all workspaces, exit 0)

# 3. Test execution:
npx playwright test src/tests/ui/Responsive --config=src/config/playwright.config.ts
# PASS (4 passed: auth setup + UI_RESP_01, UI_RESP_02, UI_RESP_03, exit 0)

# 4. Project count verification:
npx playwright test --config=src/config/playwright.config.ts --list
# PASS (Total: 3 projects - setup, api, chrome)
```
