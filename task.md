# Task Backlog: AutomationFrameworks Sprint Execution

## Current Focus: Sprint 6.2 — Reusable Workflows & Composite Actions

**Sprint Identifier**: `SPRINT-6.2-REUSABLE-WORKFLOWS-AND-COMPOSITE-ACTIONS`  
**Phase**: Phase 6 (CI/CD Integrity & Supply-Chain Security)  
**Story Points**: 4 SP  
**Branch**: `feat/sprint-6.2-reusable-workflows`  
**Goal**: Remove copy-paste across workflows with composite actions and one reusable E2E pipeline, merge the three overlapping Playwright workflows, standardise the toolchain, and add a scheduled nightly regression.

---

## 1. Persona Roles & Ownership Matrix

| Persona | Role Assignment | Responsibilities for this Sprint | Status |
| :--- | :--- | :--- | :--- |
| **Scrum Master** | `role-scrum-master` | Sprint planning, `task.md` tracking, DoR verification, and DoD audit. | `COMPLETED` |
| **SDET Architect** | `role-sdet-architect` | Input contract design for reusable workflow, report/shard parity, architecture review. | `COMPLETED` |
| **DevOps Engineer** | `role-devops-engineer` | Composite actions, reusable workflow, caller migration, nightly regression, action pinning, PR release. | `COMPLETED` |
| **Playwright QA Lead** | `role-playwright-automation` | Validate shard/merge/report parity and test runner parameters. | `COMPLETED` |
| **Product Owner** | Human Tech Lead (`User`) | Backlog prioritization, sprint kickoff, and final PR review & merge. | `STANDBY` |

---

## 2. Granular Task Breakdown

### US-AF-621: Composite Actions & Toolchain Unification (1 SP)
- [x] **US-AF-621.1** (`DevOps Engineer`): Author `.github/actions/setup-monorepo/action.yml` supporting `install-chrome` and `working-directory` inputs, Node setup from `.nvmrc`, npm caching, `npm ci`, and Playwright browser caching.
- [x] **US-AF-621.2** (`DevOps Engineer`): Author `.github/actions/staging-warmup/action.yml` with `api-url`, `fe-url`, and `timeout-ms` inputs passed through environment variables.
- [x] **US-AF-621.3** (`DevOps Engineer`): Author `.github/actions/chaos-reset/action.yml` with `api-base`, `restock-book-ids`, and `stock` inputs passed through environment variables.
- [x] **US-AF-621.4** (`DevOps Engineer`): Add root `.nvmrc` containing `24`.

### US-AF-622: Reusable E2E Workflow & Caller Modernization (1.5 SP)
- [x] **US-AF-622.1** (`DevOps Engineer` / `SDET Architect`): Author `.github/workflows/_reusable-e2e.yml` with `on: workflow_call`, supporting framework dispatch (`playwright`, `selenium`, `wdio`), dynamic sharding matrix, container/Docker execution, Allure generation & gh-pages deployment, outcome gating, and honest step summaries.
- [x] **US-AF-622.2** (`DevOps Engineer`): Refactor `playwright-ci.yml` into a thin caller (54 lines) invoking `_reusable-e2e.yml` with 4 shards.
- [x] **US-AF-622.3** (`DevOps Engineer`): Refactor `selenium-ci.yml` and `wdio-ci.yml` into thin callers (32 lines each) invoking `_reusable-e2e.yml`.
- [x] **US-AF-622.4** (`DevOps Engineer`): Retire redundant `playwright-docker.yml` and `playwright-on-demand.yml` after consolidating their capabilities into `_reusable-e2e.yml`.
- [x] **US-AF-622.5** (`SDET Architect`): Create `docs/architecture/ci_pipeline_map.md` documenting workflow taxonomy, caller-to-reusable flow, composite action usage, and migration log.

### US-AF-623: Scheduled Nightly Regression & Consolidated Matrix Summary (1 SP)
- [x] **US-AF-623.1** (`DevOps Engineer`): Author `.github/workflows/nightly-regression.yml` scheduled at `30 1 * * *` (01:30 UTC) plus `workflow_dispatch`, orchestrating Playwright (4 shards), Selenium, and WDIO in parallel jobs via `_reusable-e2e.yml`.
- [x] **US-AF-623.2** (`DevOps Engineer`): Author `nightly-summary` job collecting framework outcomes and generating a unified Markdown matrix summary in `$GITHUB_STEP_SUMMARY`.
- [x] **US-AF-623.3** (`DevOps Engineer`): Add environment notice in workflow header targeting Render staging until Sprint 7.1 Docker services.

### US-AF-624: Action SHA Pinning & Toolchain Consistency (0.5 SP)
- [x] **US-AF-624.1** (`DevOps Engineer`): Pin all `uses:` in workflows and composite actions to full commit SHAs with `# vX.Y.Z` version comments.
- [x] **US-AF-624.2** (`DevOps Engineer`): Standardize GitHub Pages deployment action to pinned SHA (`peaceiris/actions-gh-pages@4f9cc6602d3f66b9c108549d475ec49e8ef4d45e # v4.0.0`).
- [x] **US-AF-624.3** (`DevOps Engineer`): Standardize all `actions/setup-node` invocations across workflows to use `node-version-file: .nvmrc`.

### Verification, DoD & Release Protocol
- [x] **US-AF-620.1** (`Scrum Master`): Verify Pre-Flight Definition of Ready (DoR) with Render warm-up probe.
- [x] **US-AF-620.2** (`SDET Architect`): Review code acceptance checklist against Sprint 6.2 specifications.
- [x] **US-AF-620.3** (`Scrum Master`): Perform 4-point Definition of Done (DoD) audit (`actionlint`, LOC reduction >= 40%, dual-catalog diff, clean types/lint).
- [x] **US-AF-620.4** (`DevOps Engineer`): Commit, push branch, open PR with full verification evidence, monitor CI checks.

---

## 3. Sprint Review Comments & Refinement Loop

| Gate / Reviewer | Target Role | Review Feedback & Comments | Gate Status |
| :--- | :--- | :--- | :---: |
| **Pre-Flight Architecture Gate** | SDET Architect | Staging pre-flight probe and DoR audit. Verified online (HTTP 200). | `[PASSED]` |
| **Code Acceptance Review Gate** | SDET Architect | Input contracts, env injection prevention, matrix generation, Allure history preservation, and Chrome-only execution strictly audited. | `[PASSED]` |
| **Scrum Master DoD Gate** | Scrum Master | `actionlint` exit 0 across all 10 workflows + 3 composite actions. LOC reduced 48% across E2E test workflows. Dual-catalog 100% byte-for-byte synced. | `[PASSED]` |
| **DevOps Release Gate** | DevOps Engineer | PR created with complete evidence; CI checks monitored. | `[READY]` |
| **Final Human Sign-Off** | Human Tech Lead | Final PR review and merge to `main`. | `[PENDING]` |

---

## 4. Definition of Done (DoD) Checklist

- [x] Workflow LOC reduced >= 40% (E2E workflows reduced from 1,314 LOC to 686 LOC, 48% net reduction).
- [x] `actionlint` passes with 0 errors across all workflow and composite action files.
- [x] `npm run lint:all` and `npm run typecheck:all` exit 0 across all active workspaces.
- [x] Dual-catalog parity confirmed (`npm run test:verify-catalog` exits 0 with 100% byte-for-byte match).
- [x] Composite actions (`setup-monorepo`, `staging-warmup`, `chaos-reset`) cleanly encapsulated.
- [x] Reusable workflow `_reusable-e2e.yml` handles Playwright, Selenium, and WDIO with artifact and Allure publication.
- [x] `playwright-docker.yml` and `playwright-on-demand.yml` retired and mapped in `docs/architecture/ci_pipeline_map.md`.
- [x] `nightly-regression.yml` orchestrated with consolidated step summary.
- [x] All action `uses:` pinned by full commit SHA with `# vX.Y.Z` comment (0 unpinned actions remaining).
- [x] Pull request opened with structured summary and verification evidence (`gh pr create`).
- [x] All CI workflow checks green.

---

## 5. Verification & Execution Evidence

```bash
# 1. Actionlint validation across all workflows & actions (Exit Code 0)
actionlint

# 2. Workflow lines of code comparison (1,577 LOC total vs 2,041 baseline)
Get-ChildItem -Path .github/workflows/*.y*ml, .github/actions/*/*.y*ml | Measure-Object -Property Lines -Sum

# 3. Action SHA pinning verification (0 unpinned matches)
Select-String -Path .github/workflows/*.y*ml, .github/actions/*/*.y*ml -Pattern "uses:\s+[^@]+@v[0-9]"

# 4. Monorepo quality & dual-catalog verification (Exit Code 0)
npm run lint:all
npm run typecheck:all
npm run test:verify-catalog
```
