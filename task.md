# Task Backlog: AutomationFrameworks Sprint Execution

## Current Focus: Sprint 4.1 — Mobile Automation Monorepo Import & Scaffolding

**Sprint Identifier**: `SPRINT-4.1-MOBILE-IMPORT-AND-SCAFFOLDING`  
**Phase**: Phase 4 (Mobile Automation: Appium + WebdriverIO)  
**Story Points**: 4 SP  
**Branch**: `feat/sprint-4.1-mobile-automation-import-and-scaffolding`  
**Goal**: Import the Appium 2.x and WebdriverIO mobile automation framework from `buggy-books` into `AutomationFrameworks/mobile-automation`, register it in monorepo workspaces, configure device capabilities, and verify Screen Object compilation.

---

## 1. Persona Roles & Ownership Matrix

| Persona | Role Assignment | Responsibilities for this Sprint | Status |
| :--- | :--- | :--- | :--- |
| **Scrum Master** | `role-scrum-master` | Sprint planning, `task.md` tracking, DoR verification, and DoD audit. | `ACTIVE` |
| **SDET Architect** | `role-sdet-architect` | Package boundary design, monorepo workspaces registration, SOM interfaces, and code acceptance review. | `ACTIVE` |
| **Mobile QA Specialist** | `role-mobile-appium-specialist` | Scaffolding `mobile-automation`, porting Screen Objects, gesture helpers, and Appium 2.x configs. | `ACTIVE` |
| **DevOps Engineer** | `role-devops-engineer` | Environment template (.env.example), dependency audit, root scripts, and PR release lifecycle. | `ACTIVE` |
| **Product Owner** | Human Tech Lead (`User`) | Backlog prioritization, sprint kickoff, and final PR review & merge. | `STANDBY` |

---

## 2. Granular Task Breakdown

### US-AF-411: Mobile Framework Monorepo Integration (2 SP)
- [x] **US-AF-411.1** (`SDET Architect`): Design `mobile-automation` package layout, `package.json`, and `tsconfig.json` ensuring compatibility with monorepo workspaces and NodeNext/ES2022.
- [x] **US-AF-411.2** (`Mobile QA Specialist`): Port `c:\Workspace\buggy-books\mobile-automation\` into `AutomationFrameworks/mobile-automation/`:
  - `src/config/`: `wdio.shared.conf.ts`, `wdio.android.conf.ts`, `wdio.ios.conf.ts`.
  - `src/core/`: `BaseMobileScreen.ts` and `Logger.ts`.
  - `src/utils/`: `Logger.ts` (re-exported or mirrored for backward compatibility).
  - `src/screens/`: `LoginScreen.ts`, `CatalogScreen.ts`, `CartScreen.ts`, `CheckoutScreen.ts`, `ChaosScreen.ts`, `NavigationTab.ts`.
  - `src/specs/`: `auth.e2e.spec.ts`, `catalog.e2e.spec.ts`, `checkout_chaos.e2e.spec.ts`, `orientation_chaos.e2e.spec.ts`.
- [x] **US-AF-411.3** (`SDET Architect`): Register `"mobile-automation"` in root `package.json` `workspaces` array and link dependencies via `npm install`.
- [x] **US-AF-411.4** (`SDET Architect`): Add mobile test and typecheck scripts to root `package.json` (`test:mobile:android`, `test:mobile:ios`, `test:mobile:smoke`).
- [x] **US-AF-411.5** (`Mobile QA Specialist`): Verify `npm run typecheck --workspace=mobile-automation` and `npm run typecheck:all` pass with 0 errors.

### US-AF-412: Appium 2.x Configuration & Device Profiles (2 SP)
- [x] **US-AF-412.1** (`DevOps Engineer`): Author `mobile-automation/.env.example` with documented device caps (`APPIUM_HOST`, `APPIUM_PORT`, `ANDROID_DEVICE_NAME`, `ANDROID_PLATFORM_VERSION`, `IOS_DEVICE_NAME`, `IOS_PLATFORM_VERSION`).
- [x] **US-AF-412.2** (`Mobile QA Specialist`): Calibrate `wdio.android.conf.ts` for UiAutomator2 and `wdio.ios.conf.ts` for XCUITest with robust timeout/capability defaults.
- [x] **US-AF-412.3** (`Mobile QA Specialist`): Enhance `BaseMobileScreen.ts` with mobile gesture primitives (`swipeUp`, `swipeDown`, `scrollToText`, `pinch`, `setOrientation`, `getOrientation`, `hideKeyboard`).
- [x] **US-AF-412.4** (`Mobile QA Specialist`): Ensure ESLint configuration is active and `npm run lint:all` passes across all monorepo workspaces.
- [x] **US-AF-412.5** (`SDET Architect`): Conduct Code Acceptance Review and verify dual-catalog zero-diff parity.
- [x] **US-AF-412.6** (`Scrum Master`): Verify 4-point DoD checklist (`typecheck`, `lint`, dual-catalog zero-diff, docs).
- [ ] **US-AF-412.7** (`DevOps Engineer`): Commit changes, push branch, open PR via `gh pr create`, and monitor CI checks.

---

## 3. Sprint Review Comments & Refinement Loop

| Gate / Reviewer | Target Role | Review Feedback & Comments | Gate Status |
| :--- | :--- | :--- | :---: |
| **Pre-Flight Architecture Gate** | SDET Architect | Staging probe clean; package boundaries and dependency contracts defined; zero conflict with existing web frameworks. | `[PASSED]` |
| **Code Acceptance Review Gate** | SDET Architect | Screen Object encapsulation verified (`BaseMobileScreen`), touch & gesture primitives implemented (`swipeUp`, `swipeDown`, `scrollToText`, `pinch`), device profiles configured for UiAutomator2 & XCUITest, 0 type errors. | `[PASSED]` |
| **Scrum Master DoD Gate** | Scrum Master | All workspaces pass lint and typecheck with 0 errors; zero diff between dual catalogs; smoke tests passing 100%; documentation updated. | `[PASSED]` |
| **DevOps Release Gate** | DevOps Engineer | Push branch, open PR via `gh pr create`, monitor CI PR Quality Gate. | `[IN PROGRESS]` |
| **Final Human Sign-Off** | Human Tech Lead | Final PR review and merge to `main`. | `[PENDING]` |

---

## 4. Definition of Done (DoD) Checklist

- [x] `mobile-automation/` is tracked under monorepo `workspaces`.
- [x] TypeScript compilation exits `0` across all Screen Objects and specs (`npm run typecheck --workspace=mobile-automation`).
- [x] Monorepo-wide typechecking passes (`npm run typecheck:all`).
- [x] Monorepo-wide linting passes (`npm run lint:all`).
- [x] `.env.example` created in `mobile-automation/` with documented device caps.
- [x] Appium 2.x configs for Android (`UiAutomator2`) and iOS (`XCUITest`) validate without syntax errors.
- [x] Base Screen Object includes touch and gesture primitives (`swipeUp`, `swipeDown`, `scrollToText`, `pinch`, `hideKeyboard`, `setOrientation`).
- [x] Dual-catalog parity confirmed: `git diff --no-index docs/test_cases_catalog.md playwright-e2e/test_cases_catalog.md` exits 0.
- [x] Sprint documentation (`planning/Sprints/sprint_4_1_...` and `planning/README.md`) updated.
- [ ] Pull request opened with structured summary and verification evidence (`gh pr create`).
- [ ] All CI workflow checks green on PR.

---

## 5. Verification & Execution Evidence

```bash
# 1. Dual-catalog parity check (0 diff)
git diff --no-index docs/test_cases_catalog.md playwright-e2e/test_cases_catalog.md
# Exit code: 0

# 2. Static analysis across mobile-automation and all monorepo workspaces
npm run typecheck --workspace=mobile-automation # Exit code: 0
npm run typecheck:all                          # Exit code: 0 (5 workspaces)
npm run lint:all                               # Exit code: 0 (playwright-e2e + mobile-automation)

# 3. Workspaces integrity
npm ls --workspaces --depth=0
# +-- @automationframeworks/playwright-utils@1.0.0
# +-- k6-performance@1.0.0
# +-- mobile-automation@1.0.0
# +-- playwright-e2e@1.0.0
# +-- selenium-e2e@1.0.0
# `-- wdio-e2e@1.0.0

# 4. Smoke execution stability
npm run test:wdio:smoke     # 5 passed across 2 specs (48s)
npm run test:selenium:smoke # 5 passed (18s)
npm run test:playwright:smoke # 42 passed (1.7m)
```
