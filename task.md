# Task Backlog: AutomationFrameworks Sprint Execution

## Current Focus: Sprint 1.3 — Monorepo Workspaces & Utility Package Unification

**Sprint Identifier**: `SPRINT-1.3-MONOREPO-WORKSPACES-AND-UTILITY-UNIFICATION`  
**Phase**: Phase 1 (Monorepo Foundations, Pipeline Hygiene & Utility Unification)  
**Story Points**: 5 SP  
**Branch**: `feat/sprint-1.3-monorepo-workspaces-and-utility-unification`  
**Goal**: Implement an `npm workspaces` root monorepo architecture, convert `playwright-utils/` into `@automationframeworks/playwright-utils` under `packages/`, link it to `playwright-e2e`, eliminate duplicated core utilities, and establish root orchestration scripts.

---

## 1. Persona Roles & Ownership Matrix

| Persona | Role Assignment | Responsibilities for this Sprint | Status |
| :--- | :--- | :--- | :--- |
| **Scrum Master** | `role-scrum-master` | Sprint planning, `task.md` tracking, DoR verification, and DoD audit. | `ACTIVE` |
| **SDET Architect** | `role-sdet-architect` | Architecting npm workspaces schema, package boundary rules, and authoring root orchestration commands. | `ACTIVE` |
| **Playwright QA Lead** | `role-playwright-automation` | Refactoring `playwright-e2e` imports to consume `@automationframeworks/playwright-utils` and verifying zero regressions. | `ACTIVE` |
| **DevOps Engineer** | `role-devops-engineer` | Validating root workspace commands (`npm run lint:all`, `npm run typecheck:all`) and CI compatibility. | `ACTIVE` |
| **Product Owner** | Human Tech Lead (`User`) | Backlog prioritization, sprint kickoff, and final PR review & merge. | `STANDBY` |

---

## 2. Granular Task Breakdown

### US-AF-131: Root Monorepo Package & Workspace Setup (2 SP)
- [x] **US-AF-131.1** (`SDET Architect`): Create root `package.json` declaring workspaces (`packages/*`, `playwright-e2e`, `selenium-e2e`, `wdio-e2e`) and scripts (`lint:all`, `typecheck:all`, `test:smoke:all`, `clean`).
- [x] **US-AF-131.2** (`SDET Architect`): Relocate `playwright-utils/` into `packages/playwright-utils/`.
- [x] **US-AF-131.3** (`SDET Architect`): Configure `packages/playwright-utils/package.json` name as `@automationframeworks/playwright-utils` and set up exports / build scripts.
- [x] **US-AF-131.4** (`SDET Architect`): Verify root `npm install` creates workspace links cleanly without registry errors.

### US-AF-132: Elimination of Duplicated Base Utilities (3 SP)
- [x] **US-AF-132.1** (`SDET Architect`): Link `@automationframeworks/playwright-utils: "*"` in `playwright-e2e/package.json`.
- [x] **US-AF-132.2** (`Playwright QA Lead`): Audit and harmonize base utility implementations (`base.page.ts`, `logger.ts`, `common.util.ts`) in `packages/playwright-utils/src/` to support all `playwright-e2e` features (including failure capture / screenshot methods if needed).
- [x] **US-AF-132.3** (`Playwright QA Lead`): Refactor imports across `playwright-e2e` Page Objects, fixtures, and helpers to consume `@automationframeworks/playwright-utils`.
- [x] **US-AF-132.4** (`Playwright QA Lead`): Remove duplicated files from `playwright-e2e/src/core/base/` (`base.page.ts`, `common.util.ts`, `logger.ts`).
- [x] **US-AF-132.5** (`Playwright QA Lead`): Execute Playwright API & UI suites on Google Chrome, confirming 100% green pass and zero import errors.
- [x] **US-AF-132.6** (`SDET Architect`): Conduct Code Acceptance Review and verify dual catalogs parity.
- [x] **US-AF-132.7** (`Scrum Master`): Audit 4-point DoD checklist and sign off sprint gates.
- [x] **US-AF-132.8** (`DevOps Engineer`): Validate workspace scripts in CI, commit changes, push branch, and open PR via `gh pr create`.

---

## 3. Sprint Review Comments & Refinement Loop

| Gate / Reviewer | Target Role | Review Feedback & Comments | Gate Status |
| :--- | :--- | :--- | :---: |
| **Pre-Flight Architecture Gate** | SDET Architect | Verified npm workspace declaration (`packages/*`, `playwright-e2e`, `selenium-e2e`, `wdio-e2e`), package relocation to `packages/playwright-utils/`, and unified peerDependency versions. | `[APPROVED]` |
| **Code Acceptance Review Gate** | SDET Architect | Verified complete elimination of redundant base utilities in `playwright-e2e/src/core/base/`, zero raw Playwright action calls across all 8 Page Objects, and 100% clean imports from `@automationframeworks/playwright-utils`. | `[APPROVED]` |
| **Scrum Master DoD Gate** | Scrum Master | Audited `lint:all` and `typecheck:all` exiting with 0, 100% smoke test pass rate across Google Chrome UI + API, and zero catalog diff. | `[APPROVED]` |
| **DevOps Release Gate** | DevOps Engineer | Validated root workspace commands (`npm run lint:all`, `npm run typecheck:all`), updated `.github/workflows/playwright-ci.yml`, and prepared PR. | `[APPROVED]` |
| **Final Human Sign-Off** | Human Tech Lead | Final PR review and merge to `main`. | `[PENDING]` |

---

## 4. Definition of Done (DoD) Checklist

- [x] Root `package.json` with npm workspaces configured and operational (`npm run lint:all`, `npm run typecheck:all`).
- [x] `packages/playwright-utils` successfully builds and exports shared utilities as `@automationframeworks/playwright-utils`.
- [x] `playwright-e2e` consumes `@automationframeworks/playwright-utils` cleanly with zero broken imports.
- [x] Redundant duplicate `base.page.ts`, `common.util.ts`, and `logger.ts` in `playwright-e2e/src/core/base/` eliminated.
- [x] Exactly 110 Playwright tests remain active (55 API + 54 Chrome UI + 1 auth setup).
- [x] `npm run lint:all` and `npm run typecheck:all` exit 0 across all workspaces.
- [x] Dual-catalog parity confirmed: `git diff --no-index docs/test_cases_catalog.md playwright-e2e/test_cases_catalog.md` exits 0.
- [x] Sprint documentation updated in `planning/Sprints/sprint_1_3_monorepo_workspaces_and_utility_unification.md`, `planning/README.md`, and `planning/Phases/phase_1_monorepo_foundations_pipeline_hygiene_and_utility_unification.md`.
- [ ] Pull request opened with structured summary and verification evidence (`gh pr create`).

---

## 5. Verification & Execution Evidence

```bash
# Command 1: Dual-catalog parity check
git diff --no-index docs/test_cases_catalog.md playwright-e2e/test_cases_catalog.md

# Command 2: Monorepo static analysis
npm run typecheck:all
npm run lint:all

# Command 3: Full Playwright execution
npm run test:api --workspace=playwright-e2e
npm run test:smoke:all
```
