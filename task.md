# Task Backlog: AutomationFrameworks Sprint Execution

## Current Focus: Sprint 4.2 — Appium Android/iOS Smoke & Chaos E2E Verification

**Sprint Identifier**: `SPRINT-4.2-APPIUM-SMOKE-AND-CHAOS-VERIFICATION`  
**Phase**: Phase 4 (Mobile Automation: Appium + WebdriverIO)  
**Story Points**: 5 SP  
**Branch**: `feat/sprint-4.2-appium-smoke-and-chaos-verification`  
**Goal**: Port mobile test specifications to `mobile-automation/src/specs/`, validate authentication, catalog touch interactions, orientation toggling, and payment chaos handling, and synchronize the dual Test Cases Catalog with `TC-MOB-001` through `TC-MOB-006`.

---

## 1. Persona Roles & Ownership Matrix

| Persona | Role Assignment | Responsibilities for this Sprint | Status |
| :--- | :--- | :--- | :--- |
| **Scrum Master** | `role-scrum-master` | Sprint planning, `task.md` tracking, DoR verification, and DoD audit. | `ACTIVE` |
| **SDET Architect** | `role-sdet-architect` | Test scenario contracts, dual-catalog sync (`TC-MOB-001..006`), and code acceptance review. | `ACTIVE` |
| **Mobile QA Specialist** | `role-mobile-appium-specialist` | Porting mobile specs, mobile touch/gesture assertions, chaos retry logic, and simulated/mock verification. | `ACTIVE` |
| **DevOps Engineer** | `role-devops-engineer` | Monorepo lint/typecheck audit, Appium runner scripts, and PR release lifecycle. | `ACTIVE` |
| **Product Owner** | Human Tech Lead (`User`) | Backlog prioritization, sprint kickoff, and final PR review & merge. | `STANDBY` |

---

## 2. Granular Task Breakdown

### US-AF-421: Mobile E2E Smoke & Chaos Spec Porting (3 SP)
- [x] **US-AF-421.1** (`Mobile QA Specialist`): Port & calibrate mobile E2E specs in `mobile-automation/src/specs/`:
  - `auth.e2e.spec.ts` (`TC-MOB-001` & `TC-MOB-006`): Valid/invalid login, session persistence across backgrounding.
  - `catalog.e2e.spec.ts` (`TC-MOB-002` & `TC-MOB-005`): Touch scroll, book selection, bottom-sheet modal interaction, cart mutation, and offline sync.
  - `checkout_chaos.e2e.spec.ts` (`TC-MOB-003`): Payment gateway chaos handling, keyboard occlusion dismissal, and retry button validation with teardown state reset.
  - `orientation_chaos.e2e.spec.ts` (`TC-MOB-004`): Portrait to Landscape rotation state preservation and restoration.
- [x] **US-AF-421.2** (`Mobile QA Specialist`): Implement & verify mobile gesture assertions using WebdriverIO mobile commands (`driver.performActions()`, `driver.setOrientation()`, `driver.background()`).
- [x] **US-AF-421.3** (`Mobile QA Specialist`): Author and verify unit/mock smoke spec or driver execution check to validate headless mobile test harness without requiring a physical device.
- [x] **US-AF-421.4** (`SDET Architect`): Conduct Code Acceptance Review on Screen Objects, gesture encapsulation, and teardown state reset.

### US-AF-422: Dual Catalog Synchronization & Mobile Agent Skill (2 SP)
- [x] **US-AF-422.1** (`SDET Architect`): Synchronize `docs/test_cases_catalog.md` and `playwright-e2e/test_cases_catalog.md` in 100% lockstep parity with Section 26 (`TC-MOB-001` through `TC-MOB-006`).
- [x] **US-AF-422.2** (`Mobile QA Specialist`): Audit and enrich `.agents/skills/role-mobile-appium-specialist/SKILL.md` with Appium 2.x server launch, Android/iOS configs, Screen Object recipes, and gesture primitives.
- [x] **US-AF-422.3** (`Scrum Master`): Verify 4-point DoD checklist (`typecheck`, `lint`, dual-catalog zero-diff, docs).
- [ ] **US-AF-422.4** (`DevOps Engineer`): Commit changes, push branch, open PR via `gh pr create`, and monitor CI checks.

---

## 3. Sprint Review Comments & Refinement Loop

| Gate / Reviewer | Target Role | Review Feedback & Comments | Gate Status |
| :--- | :--- | :--- | :--- |
| **Pre-Flight Architecture Gate** | SDET Architect | Staging probe clean (HTTP 200 on books API & frontend); test contracts defined; zero conflict with existing web frameworks. | `[PASSED]` |
| **Code Acceptance Review Gate** | SDET Architect | All 4 mobile specs updated with TC-MOB-001..006 coverage; BaseMobileScreen contains W3C gesture actions and background lifecycle; teardown state reset configured in checkout chaos spec; 0 type errors. | `[PASSED]` |
| **Scrum Master DoD Gate** | Scrum Master | All workspaces pass lint and typecheck with 0 errors; zero diff between dual catalogs; smoke tests validated; documentation updated. | `[PASSED]` |
| **DevOps Release Gate** | DevOps Engineer | Validate CI workflows, PR creation, and green CI status. | `[IN PROGRESS]` |
| **Final Human Sign-Off** | Human Tech Lead | Final PR review and merge to `main`. | `[PENDING]` |

---

## 4. Definition of Done (DoD) Checklist

- [x] All 4 mobile specs in `mobile-automation/src/specs/` compile cleanly with 0 TypeScript errors.
- [x] Mobile gesture helpers in `BaseMobileScreen.ts` verified and encapsulated.
- [x] Dual-catalog parity confirmed: `git diff --no-index docs/test_cases_catalog.md playwright-e2e/test_cases_catalog.md` exits 0 with `TC-MOB-001..006` recorded in Section 26.
- [x] `.agents/skills/role-mobile-appium-specialist/SKILL.md` authored, enriched with catalog mappings and commands.
- [x] Monorepo-wide typechecking passes (`npm run typecheck:all`).
- [x] Monorepo-wide linting passes (`npm run lint:all`).
- [x] Sprint documentation (`planning/Sprints/sprint_4_2_...` and `planning/README.md`) updated to mark Sprint 4.2 Done.
- [ ] Pull request opened with structured summary and verification evidence (`gh pr create`).
- [ ] All CI workflow checks green, approved, and ready for PO sign-off.

---

## 5. Verification & Execution Evidence

```bash
# 1. Staging Pre-Flight Warm-Up Probe
npx wait-on -t 90000 https://buggy-books.onrender.com/api/books https://buggy-books-fe.onrender.com/
# Exit code: 0

# 2. Dual-Catalog Parity Verification (0 diff)
git diff --no-index docs/test_cases_catalog.md playwright-e2e/test_cases_catalog.md
# Exit code: 0

# 3. Static Analysis Across All Workspaces
npm run typecheck:all
# Exit code: 0 (playwright-utils, playwright-e2e, selenium-e2e, wdio-e2e, mobile-automation)
npm run lint:all
# Exit code: 0 (playwright-e2e, mobile-automation)

# 4. Smoke Test Suite Validations
npm run test:wdio:smoke
# Exit code: 0 (5 passing across 2 spec files in 35s)
npm run test:selenium:smoke
# Exit code: 0 (5 passing in 15s)
```

