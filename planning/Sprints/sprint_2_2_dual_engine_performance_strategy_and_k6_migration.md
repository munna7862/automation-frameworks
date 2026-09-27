# Sprint 2.2: Dual-Engine Performance Strategy & k6 Migration

**Navigation**: [⬅️ Previous: Sprint 2.1](sprint_2_1_intentional_bugs_and_chaos_testing_guide.md) | [🗺️ Planning Hub](../README.md) | **Sprint 2.2** | [➡️ Next: Sprint 2.3](sprint_2_3_unified_pull_request_ci_quality_gate.md)

**Sprint Identifier**: `SPRINT-2.2-DUAL-ENGINE-PERFORMANCE-AND-K6-MIGRATION`  
**Phase Mapping**: [Phase 2: Documentation Integrity, Anti-Pattern Manual & Quality Gates](../Phases/phase_2_documentation_integrity_anti_pattern_manual_and_quality_gates.md)  
**Estimated Velocity**: 5 Story Points  
**Sprint Status**: Completed  
**Sprint Goal**: Establish a dual performance testing strategy by migrating the k6 benchmarking framework alongside existing Apache JMeter suites, calibrating golden regression baselines (`baseline-perf.json`), and adding automated drift comparison in CI.

---

## 1. Persona Roles & Ownership Matrix

| Persona | Assigned Member | Responsibilities for this Sprint |
| :--- | :--- | :--- |
| **Performance Engineer** | AI Agent / Perf | Porting k6 scenarios, calibrating `baseline-perf.json`, and writing drift comparison logic. |
| **SDET Architect** | AI Agent / SDET | Harmonizing performance test cases in `docs/test_cases_catalog.md` and `playwright-e2e/test_cases_catalog.md`. |
| **DevOps Engineer** | AI Agent / DevOps | Authoring `.github/workflows/k6-performance.yaml` and configuring GitHub Step Summary reports. |

---

## 2. Sprint Backlog & Granular User Stories

### User Story US-AF-221: k6 Performance Framework Migration & Scaffolding
- **Story Statement**:  
  *As a* Performance Engineer,  
  *I want* lightweight k6 performance tests measuring API endpoint latencies,  
  *So that* developers can run local benchmarks and CI can detect latency regressions on PRs in under 60 seconds.
- **Story Points**: 2.5 SP (Medium)
- **Technical Subtasks**:
  - [x] Port `buggy-books/performance/` into `AutomationFrameworks/k6-performance/`:
    - `config/options.js`: Staged virtual user topologies (smoke, average, stress, spike, soak).
    - `scenarios/`: Catalog browsing, search query load, cart operations, order checkout stress.
    - `scripts/report-perf-summary.js`: Markdown and JSON summary generator.
    - `baseline-perf.json`: Committed golden response time baselines (p95 thresholds).
  - [x] Add k6 scripts to monorepo root:
    ```bash
    npm run perf:smoke --workspace=k6-performance
    npm run perf:drift-check --workspace=k6-performance
    ```
- **Acceptance Criteria**:
  - `k6-performance/` executes locally via `k6 run`.
  - Golden baseline comparison asserts `((current - baseline) / baseline) * 100 <= 20%`.

### User Story US-AF-222: Dual-Catalog Parity for Performance Suites
- **Story Statement**:  
  *As an* SDET Architect,  
  *I want* both `docs/test_cases_catalog.md` and `playwright-e2e/test_cases_catalog.md` updated with k6 and JMeter test suites,  
  *So that* performance coverage is fully tracked and transparent.
- **Story Points**: 2.5 SP (Medium)
- **Technical Subtasks**:
  - [x] Add entries to both catalog files:
    - `TC-PERF-001`: Catalog Browsing k6 Smoke (< 500ms p95).
    - `TC-PERF-002`: Search Endpoint k6 Average Load (< 800ms p95).
    - `TC-PERF-003`: Cart Addition k6 Stress (< 1200ms p95).
    - `TC-PERF-004`: Checkout Chaos k6 Resilience (< 2000ms p95).
    - `TC-PERF-005`: Memory & Latency Drift Gate (< 20% degradation).
    - `TC-PERF-JM-001` through `TC-PERF-JM-004`: Apache JMeter suites.
  - [x] Verify both catalog files match in 100% lockstep.
  - [x] Create `.github/workflows/k6-performance.yaml` with automated PR drift reporting.
- **Acceptance Criteria**:
  - Both catalog files have identical performance tables.
  - `.github/workflows/k6-performance.yaml` executes successfully.

---

## 3. Definition of Done & Quality Gates

- [x] `k6-performance/` fully functional with `baseline-perf.json`.
- [x] `docs/test_cases_catalog.md` and `playwright-e2e/test_cases_catalog.md` are 100% identical.
- [x] `.github/workflows/k6-performance.yaml` committed with warm-up probe and Step Summary output.
- [x] Apache JMeter suites in `jmeter/` remain pristine and functional.

---

## 4. Sprint Velocity & Deliverables Summary

| Artifact / File | Type | Target State / Description |
| :--- | :--- | :--- |
| `k6-performance/` | Directory | Complete k6 performance test framework and baseline configs. |
| `.github/workflows/k6-performance.yaml` | Workflow | CI performance pipeline with drift regression detection. |
| `docs/test_cases_catalog.md` | Catalog | Master catalog updated with dual performance suites. |
| `playwright-e2e/test_cases_catalog.md` | Catalog | Playwright duplicate catalog updated in exact lockstep. |

---

**Next Steps**: Proceed to [Sprint 2.3: Unified Pull Request CI Quality Gate (`pr-gate.yml`)](sprint_2_3_unified_pull_request_ci_quality_gate.md).
