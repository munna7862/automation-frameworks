# Task Backlog: AutomationFrameworks Sprint Execution

## Current Focus: Sprint 2.2 — Dual-Engine Performance Strategy & k6 Migration

**Sprint Identifier**: `SPRINT-2.2-DUAL-ENGINE-PERFORMANCE-AND-K6-MIGRATION`  
**Phase**: Phase 2 (Documentation Integrity, Anti-Pattern Manual & Quality Gates)  
**Story Points**: 5 SP  
**Branch**: `feat/sprint-2.2-dual-engine-performance-and-k6-migration`  
**Goal**: Establish a dual performance testing strategy by migrating the k6 benchmarking framework alongside existing Apache JMeter suites, calibrating golden regression baselines (`baseline-perf.json`), implementing automated drift comparison, and achieving 100% dual-catalog parity.

---

## 1. Persona Roles & Ownership Matrix

| Persona | Role Assignment | Responsibilities for this Sprint | Status |
| :--- | :--- | :--- | :--- |
| **Scrum Master** | `role-scrum-master` | Sprint kick-off, `task.md` tracking, DoR verification, and DoD audit. | `COMPLETED` |
| **SDET Architect** | `role-sdet-architect` | Test scenario contracts, dual-catalog sync (`TC-PERF-001`..`005`, `TC-PERF-JM-001`..`004`), code acceptance review. | `COMPLETED` |
| **Performance Engineer** | `role-performance-engineer` | Porting k6 framework into `k6-performance/`, `config/options.js`, scenarios, `report-perf-summary.js`, `baseline-perf.json`. | `COMPLETED` |
| **DevOps Engineer** | `role-devops-engineer` | Authoring `.github/workflows/k6-performance.yaml`, Render pre-flight probe, PR release lifecycle. | `ACTIVE` |
| **Product Owner** | Human Tech Lead (`User`) | Backlog prioritization, sprint kickoff, and final PR review & merge. | `STANDBY` |

---

## 2. Granular Task Breakdown

### US-AF-221: k6 Performance Framework Migration & Scaffolding (2.5 SP)
- [x] **US-AF-221.1** (`Performance Engineer`): Port k6 framework into `k6-performance/` including `run-k6.js`, `package.json`, and utilities (`html-reporter.js`, `history-tracker.js`, `summary-handler.js`).
- [x] **US-AF-221.2** (`Performance Engineer`): Implement modular `config/options.js` with staged virtual user topologies (smoke, average, stress, spike, soak).
- [x] **US-AF-221.3** (`Performance Engineer`): Port and implement test scenarios in `k6-performance/scenarios/` (Catalog browsing, search query load, cart operations, order checkout stress, auth, inventory).
- [x] **US-AF-221.4** (`Performance Engineer`): Implement `scripts/report-perf-summary.js` and calibrate golden baseline `baseline-perf.json` with drift comparison logic (`<= 20%`).
- [x] **US-AF-221.5** (`Performance Engineer`): Add `k6-performance` workspace to monorepo root `package.json` with `perf:smoke` and `perf:drift-check` runner scripts.
- [x] **US-AF-221.6** (`Performance Engineer`): Validate local execution via `k6 run` and drift gate assertions.

### US-AF-222: Dual-Catalog Parity for Performance Suites & CI Pipeline (2.5 SP)
- [x] **US-AF-222.1** (`SDET Architect`): Add performance test entries (`TC-PERF-001` through `TC-PERF-005` and `TC-PERF-JM-001` through `TC-PERF-JM-004`) to `docs/test_cases_catalog.md`.
- [x] **US-AF-222.2** (`SDET Architect`): Synchronize `playwright-e2e/test_cases_catalog.md` in 100% character-for-character lockstep parity.
- [x] **US-AF-222.3** (`DevOps Engineer`): Author `.github/workflows/k6-performance.yaml` with Render warm-up pre-flight probe, smoke execution, drift check, and GitHub Step Summary generation.
- [x] **US-AF-222.4** (`SDET Architect`): Conduct Code Acceptance Review on authored scenarios, baseline configs, and workflow syntax.
- [x] **US-AF-222.5** (`Scrum Master`): Perform 4-point DoD verification audit (static analysis, catalog zero diff, clean passes).
- [ ] **US-AF-222.6** (`DevOps Engineer`): Git commit with conventional syntax, push branch, open PR via `gh pr create`, and monitor CI checks.

---

## 3. Sprint Review Comments & Refinement Loop

| Gate / Reviewer | Target Role | Review Feedback & Comments | Gate Status |
| :--- | :--- | :--- | :---: |
| **Pre-Flight Architecture Gate** | SDET Architect | Staging warm-up passed, branch checked out, dual-catalog baseline parity confirmed (diff: 0). | `[APPROVED]` |
| **Code Acceptance Review Gate** | SDET Architect | Verified k6 modular topology in `config/options.js`, calibrated golden baselines in `baseline-perf.json`, verified <= 20% drift enforcement, tested simulated regression trigger (+25% alert), and confirmed teardown state reset hooks. | `[APPROVED]` |
| **Scrum Master DoD Gate** | Scrum Master | Audited static typechecks (`npm run typecheck:all`), linting (`npm run lint:all`), unit tests (5/5 pass), dual-catalog diff (0 diff), and root script execution (`npm run perf:smoke` & `npm run perf:drift-check`). | `[APPROVED]` |
| **DevOps Release Gate** | DevOps Engineer | Validate CI workflow syntax, Step Summary formatting, and PR submission. | `[IN_PROGRESS]` |
| **Final Human Sign-Off** | Human Tech Lead | Final PR review and merge to `main`. | `[PENDING]` |

---

## 4. Definition of Done (DoD) Checklist

- [x] `k6-performance/` fully functional with `baseline-perf.json`, `config/options.js`, scenarios, and runner scripts.
- [x] Golden baseline comparison asserts `((current - baseline) / baseline) * 100 <= 20%`.
- [x] `npm run perf:smoke` and `npm run perf:drift-check` executable from root via workspaces.
- [x] `docs/test_cases_catalog.md` and `playwright-e2e/test_cases_catalog.md` are 100% identical.
- [x] `.github/workflows/k6-performance.yaml` committed with Render warm-up probe and Step Summary output.
- [x] Apache JMeter suites in `jmeter/` remain pristine and functional.
- [x] Static quality checks (`npm run lint:all`, `npm run typecheck:all`) exit 0 with zero errors.
- [ ] Pull request opened with structured summary and verification evidence (`gh pr create`).

---

## 5. Verification & Execution Evidence

```bash
# Command 1: Dual-catalog parity check
git diff --no-index docs/test_cases_catalog.md playwright-e2e/test_cases_catalog.md
# Result: 0 diff, exit code 0

# Command 2: k6 Smoke execution
npm run perf:smoke
# Result: 57 requests executed across 5 VUs, 0% errors, exit code 0

# Command 3: k6 Drift check execution
npm run perf:drift-check
# Result: All metrics within golden baseline SLA, exit code 0

# Command 4: Monorepo typecheck & lint
npm run typecheck:all
npm run lint:all
# Result: All workspaces pass with exit code 0
```
