# Task Backlog: AutomationFrameworks Sprint Execution

## Current Focus: Sprint 1.1 — Workflow Cleanup & Extensionless File Purge

**Sprint Identifier**: `SPRINT-1.1-WORKFLOW-CLEANUP-AND-EXTENSIONLESS-PURGE`  
**Phase**: Phase 1 (Monorepo Foundations, Pipeline Hygiene & Utility Unification)  
**Story Points**: 2 SP  
**Branch**: `feat/sprint-1.1-workflow-cleanup-and-extensionless-file-purge`  
**Goal**: Purge broken extensionless workflow files and obsolete legacy CRUD test pipelines from `.github/workflows/`, ensuring all remaining workflows have valid kebab-case YAML syntax and incorporate mandatory Render staging warm-up probes.

---

## 1. Persona Roles & Ownership Matrix

| Persona | Role Assignment | Responsibilities for this Sprint | Status |
| :--- | :--- | :--- | :--- |
| **Scrum Master** | `role-scrum-master` | Sprint planning, `task.md` tracking, DoR verification, and DoD audit. | `ACTIVE` |
| **SDET Architect** | `role-sdet-architect` | Test pipeline validation, single-browser policy audit, and dual-catalog parity review. | `ACTIVE` |
| **DevOps Engineer** | `role-devops-engineer` | Deleting dead workflows, standardizing warm-up probes, YAML schema validation, and PR release lifecycle. | `ACTIVE` |
| **Product Owner** | Human Tech Lead (`User`) | Backlog prioritization, sprint kickoff, and final PR review & merge. | `STANDBY` |

---

## 2. Granular Task Breakdown

### US-AF-111: Extensionless Dead Workflow Deletion (1 SP)
- [x] **US-AF-111.1** (`DevOps Engineer`): Identify and delete the 4 extensionless files from `.github/workflows/`:
  - `.github/workflows/Playwright Automation CI (Sharded)`
  - `.github/workflows/Playwright Automation CI - Docker (Sharded Optimized)`
  - `.github/workflows/Playwright Automation CI - Docker (Sharded)`
  - `.github/workflows/Playwright Automation CI - Kubernetes (Sharded Optimized)`
- [x] **US-AF-111.2** (`DevOps Engineer`): Delete legacy `.github/workflows/performance-crud.yaml` (superseded by `jmeter-performance.yaml`).
- [x] **US-AF-111.3** (`DevOps Engineer`): Verify git status to confirm all 5 dead files are staged/removed.

### US-AF-112: Pre-Flight Warm-Up Probe Standardization (1 SP)
- [x] **US-AF-112.1** (`DevOps Engineer`): Inspect `.github/workflows/playwright-ci.yml`, `playwright-docker.yml`, `jmeter-performance.yaml`, `playwright-on-demand.yml`, and `quarantine-audit.yml`.
- [x] **US-AF-112.2** (`DevOps Engineer`): Standardize the Render Staging Warm-Up Pre-Flight Probe across all active workflows.
- [x] **US-AF-112.3** (`SDET Architect`): Verify single Google Chrome browser policy (`channel: 'chrome'` or `npx playwright install --with-deps chrome`) in all workflow definitions.
- [x] **US-AF-112.4** (`DevOps Engineer`): Validate YAML syntax across all remaining `.github/workflows/*.{yml,yaml}` files.
- [x] **US-AF-112.5** (`Scrum Master`): Verify 4-point DoD checklist, catalog parity, and sprint status updates.
- [ ] **US-AF-112.6** (`DevOps Engineer`): Commit with conventional syntax, push branch, and open PR via `gh pr create`.

---

## 3. Sprint Review Comments & Refinement Loop

| Gate / Reviewer | Target Role | Review Feedback & Comments | Gate Status |
| :--- | :--- | :--- | :---: |
| **Pre-Flight Architecture Gate** | SDET Architect | Verified test design, pipeline cleanliness, and single-browser Chrome policy. | `[APPROVED]` |
| **Code Acceptance Review Gate** | SDET Architect | Verified 0 extensionless workflows, valid YAML schemas, and Render warm-up probes. | `[APPROVED]` |
| **Scrum Master DoD Gate** | Scrum Master | Audited lint, typecheck, catalog parity, and documentation updates. | `[APPROVED]` |
| **DevOps Release Gate** | DevOps Engineer | CI workflows verified, preparing conventional commit and PR delivery. | `[IN PROGRESS]` |
| **Final Human Sign-Off** | Human Tech Lead | Final PR review and merge to `main`. | `[PENDING]` |

---

## 4. Definition of Done (DoD) Checklist

- [x] All 4 extensionless workflow files are deleted.
- [x] Legacy `performance-crud.yaml` is deleted.
- [x] All remaining workflow files possess `.yml` or `.yaml` extensions with valid YAML syntax.
- [x] Render staging warm-up pre-flight probe is standardized in all staging-facing workflows.
- [x] Single Google Chrome browser policy is strictly enforced across workflows.
- [x] Dual-catalog parity confirmed (`docs/test_cases_catalog.md` vs `playwright-e2e/test_cases_catalog.md`).
- [x] `npm run lint` and `npm run typecheck` pass with 0 errors.
- [x] Sprint 1.1 status updated to `In Progress` / `Done` in planning documents.
- [ ] Pull request opened with structured summary and verification evidence (`gh pr create`).

---

## 5. Verification & Execution Evidence

```bash
# Command 1: Dual-catalog parity check
git diff --exit-code docs/test_cases_catalog.md playwright-e2e/test_cases_catalog.md

# Command 2: Static analysis
npm run typecheck --prefix playwright-e2e
npm run lint --prefix playwright-e2e

# Command 3: Workflow file validation (0 extensionless files)
Get-ChildItem -Path .github/workflows
```
