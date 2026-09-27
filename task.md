# Task Backlog: AutomationFrameworks Sprint Execution

## Current Focus: Sprint 1.2 — Standardized Environment Templates & Visual Baseline Calibration

**Sprint Identifier**: `SPRINT-1.2-ENV-TEMPLATES-AND-VISUAL-CALIBRATION`  
**Phase**: Phase 1 (Monorepo Foundations, Pipeline Hygiene & Utility Unification)  
**Story Points**: 3 SP  
**Branch**: `feat/sprint-1.2-env-templates-and-visual-baseline-calibration`  
**Goal**: Create documented, secure `.env.example` templates for all monorepo test frameworks, and calibrate golden visual regression baselines for `Test_010_VisualRegressionChaos.spec.ts` strictly under Google Chrome (`channel: 'chrome'`).

---

## 1. Persona Roles & Ownership Matrix

| Persona | Role Assignment | Responsibilities for this Sprint | Status |
| :--- | :--- | :--- | :--- |
| **Scrum Master** | `role-scrum-master` | Sprint planning, `task.md` tracking, DoR verification, and DoD audit. | `ACTIVE` |
| **SDET Architect** | `role-sdet-architect` | Designing standardized environment configuration schemas and documenting default variables. | `ACTIVE` |
| **Playwright QA Lead** | `role-playwright-automation` | Calibrating visual regression snapshots for `Test_010_VisualRegressionChaos.spec.ts` under Chrome and updating snapshot configs. | `ACTIVE` |
| **DevOps Engineer** | `role-devops-engineer` | Ensuring CI environment variables map correctly to `.env.example` definitions across GitHub runners. | `ACTIVE` |
| **Product Owner** | Human Tech Lead (`User`) | Backlog prioritization, sprint kickoff, and final PR review & merge. | `STANDBY` |

---

## 2. Granular Task Breakdown

### US-AF-121: Standardized Environment Configuration Templates (1.5 SP)
- [x] **US-AF-121.1** (`SDET Architect`): Design global monorepo environment schema and create root `.env.example`.
- [x] **US-AF-121.2** (`SDET Architect`): Create framework-specific `playwright-e2e/.env.example` with Playwright variables.
- [x] **US-AF-121.3** (`SDET Architect`): Create `selenium-e2e/.env.example` and `wdio-e2e/.env.example`.
- [x] **US-AF-121.4** (`DevOps Engineer`): Verify `.gitignore` rules prevent `.env` commits while permitting `.env.example`.

### US-AF-122: Visual Baseline Calibration for Google Chrome (1.5 SP)
- [x] **US-AF-122.1** (`Playwright QA Lead`): Inspect `Test_010_VisualRegressionChaos.spec.ts` and ensure comparison options (`maxDiffPixelRatio: 0.05`, `threshold: 0.2`, `animations: 'disabled'`).
- [x] **US-AF-122.2** (`Playwright QA Lead`): Calibrate snapshot expectations in `Test_010_VisualRegressionChaos.spec.ts-snapshots/` for `chrome-win32` and `chrome-linux`.
- [x] **US-AF-122.3** (`Playwright QA Lead`): Purge obsolete non-Chrome or misnamed snapshots (e.g., duplicate/legacy snapshots).
- [x] **US-AF-122.4** (`Playwright QA Lead`): Execute visual regression test suite on Chrome locally and confirm 100% green pass.
- [x] **US-AF-122.5** (`SDET Architect`): Conduct Code Acceptance Review and verify dual catalogs parity.
- [x] **US-AF-122.6** (`Scrum Master`): Audit 4-point DoD checklist and sign off sprint gates.
- [x] **US-AF-122.7** (`DevOps Engineer`): Commit changes, push branch, and open PR via `gh pr create`.

---

## 3. Sprint Review Comments & Refinement Loop

| Gate / Reviewer | Target Role | Review Feedback & Comments | Gate Status |
| :--- | :--- | :--- | :---: |
| **Pre-Flight Architecture Gate** | SDET Architect | Verified environment schemas, `.gitignore` exceptions, and visual comparison options. | `[APPROVED]` |
| **Code Acceptance Review Gate** | SDET Architect | Verified single Chrome browser snapshots (`chrome-win32`, `chrome-linux`), networkidle loading, and 0 obsolete files. | `[APPROVED]` |
| **Scrum Master DoD Gate** | Scrum Master | Audited lint, typecheck, 100% green test execution (10/10 passed), and 0 catalog diff. | `[APPROVED]` |
| **DevOps Release Gate** | DevOps Engineer | Validated branch hygiene, commit conventions, and GitHub CLI PR workflow. | `[APPROVED]` |
| **Final Human Sign-Off** | Human Tech Lead | Final PR review and merge to `main`. | `[PENDING]` |

---

## 4. Definition of Done (DoD) Checklist

- [x] `.env.example` files created in root, `playwright-e2e/`, `selenium-e2e/`, and `wdio-e2e/`.
- [x] Visual regression test passes locally on project `chrome` (10/10 passed, 0 failed, 0 flaky).
- [x] No multiple browser snapshots (no Firefox or WebKit) exist in snapshot directories.
- [x] `.gitignore` prevents `.env` or temporary screenshot diffs from being committed.
- [x] Dual-catalog parity confirmed: `git diff --exit-code docs/test_cases_catalog.md playwright-e2e/test_cases_catalog.md` exits 0.
- [x] `npm run lint` and `npm run typecheck` pass across all active workspaces with 0 errors.
- [x] Sprint documentation updated in `planning/Sprints/sprint_1_2_standardized_env_templates_and_visual_baseline_calibration.md`, `planning/README.md`, and `planning/Phases/phase_1_monorepo_foundations_pipeline_hygiene_and_utility_unification.md`.
- [x] Pull request opened with structured summary and verification evidence (`gh pr create`).

---

## 5. Verification & Execution Evidence

```bash
# Command 1: Dual-catalog parity check
git diff --exit-code docs/test_cases_catalog.md playwright-e2e/test_cases_catalog.md

# Command 2: Static analysis
npm run typecheck --prefix playwright-e2e
npm run lint --prefix playwright-e2e

# Command 3: Visual regression test execution
npx playwright test src/tests/ui/VisualRegression/Test_010_VisualRegressionChaos.spec.ts --project=chrome
```
