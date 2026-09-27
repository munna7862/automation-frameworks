# Task Backlog: AutomationFrameworks Sprint Execution

## Current Focus: Sprint 2.3 — Unified Pull Request CI Quality Gate (`pr-gate.yml`)

**Sprint Identifier**: `SPRINT-2.3-UNIFIED-PR-QUALITY-GATE`  
**Phase**: Phase 2 (Documentation Integrity, Anti-Pattern Manual & Quality Gates)  
**Story Points**: 4 SP  
**Branch**: `feat/sprint-2.3-unified-pr-quality-gate`  
**Goal**: Implement an automated, fast-feedback Pull Request Quality Gate pipeline (`.github/workflows/pr-gate.yml`) that validates static quality, warms up staging, and executes smoke tests on Google Chrome in under 3 minutes, blocking regressions from merging into `main`.

---

## 1. Persona Roles & Ownership Matrix

| Persona | Role Assignment | Responsibilities for this Sprint | Status |
| :--- | :--- | :--- | :--- |
| **Scrum Master** | `role-scrum-master` | Sprint planning, `task.md` tracking, DoR verification, and DoD audit. | `ACTIVE` |
| **SDET Architect** | `role-sdet-architect` | Quality thresholds, smoke test suite alignment, dual-catalog verification, and code review. | `ACTIVE` |
| **DevOps Engineer** | `role-devops-engineer` | Authoring `.github/workflows/pr-gate.yml`, concurrency, caching, and PR release lifecycle. | `ACTIVE` |
| **Playwright QA Lead** | `role-playwright-automation` | Smoke test determinism, single-browser policy (Google Chrome), test tagging verification. | `ACTIVE` |
| **Product Owner** | Human Tech Lead (`User`) | Backlog prioritization, sprint kickoff, and final PR review & merge. | `STANDBY` |

---

## 2. Granular Task Breakdown

### US-AF-231: Fast PR CI Pipeline Architecture (2.5 SP)
- [x] **US-AF-231.1** (`Scrum Master`): Kick off sprint, verify Definition of Ready (DoR) with Render warm-up pre-flight probe.
- [x] **US-AF-231.2** (`SDET Architect`): Define PR Quality Gate architecture, job separation (static quality vs. smoke e2e), and verify smoke test suite scope.
- [x] **US-AF-231.3** (`DevOps Engineer`): Author `.github/workflows/pr-gate.yml` with concurrency control, npm caching, staging pre-flight probe, and single-browser Chrome installation.
- [x] **US-AF-231.4** (`DevOps Engineer`): Validate root workspace scripts (`lint:all`, `typecheck:all`, `test:smoke:all`) for seamless CI execution.

### US-AF-232: Automated PR Feedback & Step Summary (1.5 SP)
- [x] **US-AF-232.1** (`DevOps Engineer`): Add rich GitHub Step Summary generation reporting job status, environment, browser, and test results.
- [x] **US-AF-232.2** (`SDET Architect`): Conduct Code Acceptance Review of the PR Quality Gate workflow and configurations.
- [x] **US-AF-232.3** (`Scrum Master`): Perform 4-point Definition of Done (DoD) audit (lint, typecheck, catalog parity, documentation).
- [ ] **US-AF-232.4** (`DevOps Engineer`): Push branch, open Pull Request via `gh pr create`, monitor CI checks, and present for merge.

---

## 3. Sprint Review Comments & Refinement Loop

| Gate / Reviewer | Target Role | Review Feedback & Comments | Gate Status |
| :--- | :--- | :--- | :---: |
| **Pre-Flight Architecture Gate** | SDET Architect | Architecture verified: parallel static quality (Node 22, npm ci, lint:all, typecheck:all) + smoke e2e with Render warm-up (90s) + Google Chrome installation + teardown state reset. Concurrency cancel-in-progress configured. | `[APPROVED]` |
| **Code Acceptance Review Gate** | SDET Architect | Workflow adheres to security practices (`contents: read`), timeouts (5m/10m), single-browser policy (`channel: 'chrome'`), and markdown table Step Summary. | `[APPROVED]` |
| **Scrum Master DoD Gate** | Scrum Master | All 4 DoD criteria verified: lint:all (exit 0), typecheck:all (exit 0), dual-catalog diff (exit 0), sprint planning docs updated. Ready for release. | `[APPROVED]` |
| **DevOps Release Gate** | DevOps Engineer | Push branch `feat/sprint-2.3-unified-pr-quality-gate`, open PR via `gh pr create`, and monitor checks. | `[PENDING]` |
| **Final Human Sign-Off** | Human Tech Lead | Final PR review and merge to `main`. | `[PENDING]` |

---

## 4. Definition of Done (DoD) Checklist

- [x] `.github/workflows/pr-gate.yml` committed and active on `pull_request: [main]`.
- [x] Strict single-browser rule adhered to (`channel: 'chrome'`).
- [x] Mandatory Render warm-up probe included.
- [x] Concurrency controls cancel outdated in-progress runs on the same branch.
- [x] `npm run lint:all` and `npm run typecheck:all` pass across all active workspaces with 0 errors.
- [x] Dual-catalog parity confirmed: `git diff --exit-code docs/test_cases_catalog.md playwright-e2e/test_cases_catalog.md` exits 0.
- [x] Sprint documentation and status updated in `planning/README.md` and `planning/Sprints/sprint_2_3_unified_pull_request_ci_quality_gate.md`.
- [ ] Pull request opened with structured summary and verification evidence (`gh pr create`).
- [ ] All CI workflow checks green, approved, and handed over to Human PO.

---

## 5. Verification & Execution Evidence

```bash
# Command 1: Dual-catalog parity check
git diff --exit-code docs/test_cases_catalog.md playwright-e2e/test_cases_catalog.md

# Command 2: Static analysis
npm run lint:all
npm run typecheck:all

# Command 3: Workflow validation / smoke test run
npm run test:smoke:all
```
