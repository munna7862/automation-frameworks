# Phase 2: Documentation Integrity, Anti-Pattern Manual & Quality Gates

**Navigation**: [🗺️ Planning Hub](../README.md) | [📖 Master Plan](../Master/master_plan.md) | [Phase 1](phase_1_monorepo_foundations_pipeline_hygiene_and_utility_unification.md) | **[Phase 2]** | [Phase 3](phase_3_webdriverio_and_selenium_alignment_to_buggybooks.md) | [Phase 4](phase_4_mobile_automation_appium_and_webdriverio.md) | [Phase 5](phase_5_executive_observability_and_unified_allure_dashboard.md)

**Phase Identifier**: `PHASE-2-DOCS-CHAOS-AND-GATES`  
**Phase Status**: Planned  
**Total Phase Velocity**: **12 Story Points** (Sprint 2.1: 3 SP, Sprint 2.2: 5 SP, Sprint 2.3: 4 SP)  
**Phase Leads**: SDET Architect & DevOps Engineer  
**Primary Personas**: SDET Architect, Performance Engineer, DevOps Engineer, Playwright QA Lead  

---

## 1. Executive Summary & Phase Theme

**Phase 2** establishes rigorous governance, comprehensive documentation of intentional application failure modes, dual-engine performance benchmarking, and automated pull request quality gates across the `AutomationFrameworks` monorepo.

Testing modern distributed systems requires validating failure resilience just as thoroughly as happy paths. The BuggyBooks platform includes intentional chaos parameters (payment failure rates, inventory latency, visual layout distortion, rate limiting, and session sandboxing). However, without authoritative documentation, engineers and AI assistants cannot systematically test or remediate these anti-patterns, risking server state contamination.

Furthermore, while Apache JMeter provides enterprise-scale capacity and stress testing, the monorepo currently lacks developer-centric, lightweight performance benchmarking that can run natively in CI on every pull request.

**Phase 2** solves these challenges by:
1. Authoring the complete `docs/intentional_bugs.md` manual in 100% compliance with `doc-implementation-standards`.
2. Establishing a dual-engine performance strategy by migrating k6 benchmarking scripts alongside existing Apache JMeter suites.
3. Implementing an automated, fast-feedback PR Quality Gate (`pr-gate.yml`) that blocks regressions before code reaches the `main` branch.

---

## 2. Architectural Scope & Target Outcomes

| Subsystem / Workstream | Current State / Defect | Phase Target Outcome |
| :--- | :--- | :--- |
| **Chaos & Anti-Pattern Manual** | `docs/` is missing `intentional_bugs.md`; chaos parameters and remediation patterns are undocumented. | Comprehensive `docs/intentional_bugs.md` detailing all backend/frontend anti-patterns, chaos endpoints, and safe reset recipes. |
| **Performance Engineering Strategy** | Only Apache JMeter suites exist; no fast, PR-level automated baseline drift regression checks. | Dual performance capability: JMeter (stress/capacity) + k6 (fast CI baseline regression with automated drift alerts). |
| **Performance Baseline Tracking** | No committed performance baselines; latency regressions cannot be automatically measured. | `k6-performance/baseline-perf.json` committed with automated regression comparison script (`report-perf-summary.js`). |
| **PR Quality Enforcement** | PRs can be merged without automated validation; no unified PR gate runs linting and smoke tests. | `.github/workflows/pr-gate.yml` executes in < 3 minutes, running lint, typecheck, pre-flight probe, and smoke tests. |
| **Documentation Traceability** | Dual test catalogs lack explicit mapping for k6 performance test cases. | Both `docs/test_cases_catalog.md` and `playwright-e2e/test_cases_catalog.md` reflect `TC-PERF-001..005` (k6) and `TC-PERF-JM-001..004` (JMeter). |

---

## 3. Sprints in this Phase

```mermaid
graph LR
    S21[Sprint 2.1: Intentional Bugs & Chaos Testing Guide (3 SP)] --> S22[Sprint 2.2: Dual-Engine Performance Strategy & k6 Migration (5 SP)]
    S22 --> S23[Sprint 2.3: Unified Pull Request CI Quality Gate (4 SP)]
```

### Sprint Breakdown

1. **[Sprint 2.1: Intentional Bugs & Chaos Testing Guide](../Sprints/sprint_2_1_intentional_bugs_and_chaos_testing_guide.md)**
   - *Estimated Effort*: 3 Story Points
   - *Target Pillars*: Pillar 4 (Intentional Bugs & Chaos Testing Guide)
   - *Key Deliverables*:
     - Authoring `docs/intentional_bugs.md` documenting:
       - **Backend Anti-Patterns**: Intermittent payment failures (`POST /api/test/config` with `checkoutFailureRate`), inventory delay (`inventoryDelayMs`), session sandboxing (`x-test-session-id`), Express rate limiting (`429 Too Many Requests`).
       - **UI Anti-Patterns**: Obfuscated locators & missing testids, dynamic button delay (500–3500ms), Shadow DOM encapsulation (`<order-summary-box>`), visual layout chaos.
       - **Remediation Code Recipes**: Explicit Playwright, Selenium, and WDIO code examples demonstrating proper auto-waiting, shadow DOM piercing, and mandatory teardown resets (`POST /api/test/reset`).
     - Synchronization of references in `AGENTS.md` and `.agents/skills/chaos-and-bug-testing/`.
   - *Verification*: Full compliance with `doc-implementation-standards` skill; all documented endpoints validated against live staging.

2. **[Sprint 2.2: Dual-Engine Performance Strategy & k6 Migration](../Sprints/sprint_2_2_dual_engine_performance_strategy_and_k6_migration.md)**
   - *Estimated Effort*: 5 Story Points
   - *Target Pillars*: Pillar 8 (Dual-Engine Performance Strategy: JMeter + k6)
   - *Key Deliverables*:
     - Porting k6 performance framework from `buggy-books/performance/` into `AutomationFrameworks/k6-performance/`:
       - `config/options.js`: Staged load topologies (smoke, average, stress, spike, soak).
       - Scenarios: Catalog browsing, search query load, cart operations, order checkout stress.
       - Regression engine: `baseline-perf.json` and `scripts/report-perf-summary.js`.
     - Creation of `.github/workflows/k6-performance.yaml` supporting on-demand parameterization and PR baseline comparison (`drift <= 20%`).
     - Harmonization of both catalog files (`docs/test_cases_catalog.md` and `playwright-e2e/test_cases_catalog.md`) to index:
       - `TC-PERF-001` through `TC-PERF-005` (k6).
       - `TC-PERF-JM-001` through `TC-PERF-JM-004` (Apache JMeter).
   - *Verification*: `npm run perf:smoke` runs locally with k6; CI workflow runs green on GitHub Actions.

3. **[Sprint 2.3: Unified Pull Request CI Quality Gate (`pr-gate.yml`)](../Sprints/sprint_2_3_unified_pull_request_ci_quality_gate.md)**
   - *Estimated Effort*: 4 Story Points
   - *Target Pillars*: Pillar 9 (Unified Pull Request Quality Gate)
   - *Key Deliverables*:
     - Authoring `.github/workflows/pr-gate.yml` triggered on `pull_request: [main]`:
       - **Job 1 (Static Quality)**: Parallel linting and typechecking across all workspace packages (`npm run lint:all`, `npm run typecheck:all`).
       - **Job 2 (Pre-Flight Probe)**: Mandatory `wait-on` probe ensuring Render backend and frontend instances are warm (90s timeout).
       - **Job 3 (Smoke Test Suite)**: Fast smoke execution in Google Chrome (`channel: 'chrome'`) and core API checks (< 120s execution).
       - **Job 4 (PR Summary)**: GitHub Step Summary and PR status commenting with exact failure traces and test counts.
     - Enforcement of branch protection rules requiring `pr-gate` to pass before merge.
   - *Verification*: Opening or updating a PR triggers `pr-gate.yml`; pipeline completes within 3 minutes and blocks faulty commits.

---

## 4. Definition of Done & Quality Acceptance Gates

- [ ] `docs/intentional_bugs.md` is authored, reviewed, and published with complete code examples for all 8 documented anti-patterns.
- [ ] Both test case catalog files (`docs/test_cases_catalog.md` and `playwright-e2e/test_cases_catalog.md`) maintain 100% parity across all JMeter and k6 entries.
- [ ] `k6-performance/` framework is operational with calibrated baseline thresholds (`baseline-perf.json`).
- [ ] `.github/workflows/k6-performance.yaml` successfully executes and generates GitHub Step Summary tables.
- [ ] `.github/workflows/pr-gate.yml` is active on pull requests, enforcing zero lint errors and 100% green smoke test execution.
- [ ] Pre-flight warm-up probe is incorporated into all staging-facing CI workflows.

---

## 5. Risks, Gotchas & Mitigation Strategies

| Threat / Gotcha | Impact | Mitigation Strategy |
| :--- | :--- | :--- |
| **Chaos Contamination during k6 Runs** | High-concurrency k6 tests trigger rate limits or modify shared inventory. | Isolate performance runs using `x-test-session-id` headers and execute teardown reset (`POST /api/test/reset`) in `teardown()`. |
| **k6 Version Incompatibility** | CI runner lacks k6 binary or encounters architecture mismatch. | Use official `grafana/k6-action@v0.3.1` or pinned GitHub Actions action in workflow. |
| **PR Gate Latency Bloat** | PR gate takes too long (> 10 mins), frustrating developer velocity. | Restrict PR gate tests strictly to `@smoke` tag and pure headless API tests; reserve full regression for `playwright-ci.yml`. |
