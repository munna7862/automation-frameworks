# Sprint 1.1: Workflow Cleanup & Extensionless File Purge

**Navigation**: [🗺️ Planning Hub](../README.md) | [📖 Master Plan](../Master/master_plan.md) | **Sprint 1.1** | [➡️ Next: Sprint 1.2](sprint_1_2_standardized_env_templates_and_visual_baseline_calibration.md)

**Sprint Identifier**: `SPRINT-1.1-WORKFLOW-CLEANUP-AND-EXTENSIONLESS-PURGE`  
**Phase Mapping**: [Phase 1: Monorepo Foundations, Pipeline Hygiene & Utility Unification](../Phases/phase_1_monorepo_foundations_pipeline_hygiene_and_utility_unification.md)  
**Estimated Velocity**: 2 Story Points  
**Sprint Status**: Ready for Execution  
**Sprint Goal**: Purge broken extensionless workflow files and obsolete legacy CRUD test pipelines from `.github/workflows/`, ensuring all remaining workflows have valid kebab-case YAML syntax and incorporate mandatory Render staging warm-up probes.

---

## 1. Persona Roles & Ownership Matrix

| Persona | Assigned Member | Responsibilities for this Sprint |
| :--- | :--- | :--- |
| **DevOps Engineer** | AI Agent / DevOps | Removing dead extensionless workflow files, validating GitHub Actions YAML schemas, and auditing trigger events. |
| **SDET Architect** | AI Agent / SDET | Ensuring test pipeline definitions align with the single-browser execution policy (`channel: 'chrome'`). |
| **Playwright QA Lead** | AI Agent / QA | Verifying that active Playwright workflows (`playwright-ci.yml`, `playwright-docker.yml`) execute cleanly without deprecated references. |

---

## 2. Sprint Backlog & Granular User Stories

### User Story US-AF-111: Extensionless Dead Workflow Deletion
- **Story Statement**:  
  *As a* DevOps Engineer maintaining GitHub Actions pipelines,  
  *I want* to permanently delete extensionless workflow files that fail GitHub Actions schema validation,  
  *So that* the CI workflow tab is clean and free of parsing errors or rogue job definitions.
- **Story Points**: 1 SP (Small)
- **Technical Subtasks**:
  - [ ] Identify and delete the 4 extensionless files from `.github/workflows/`:
    - `.github/workflows/Playwright Automation CI (Sharded)`
    - `.github/workflows/Playwright Automation CI - Docker (Sharded Optimized)`
    - `.github/workflows/Playwright Automation CI - Docker (Sharded)`
    - `.github/workflows/Playwright Automation CI - Kubernetes (Sharded Optimized)`
  - [ ] Delete legacy `.github/workflows/performance-crud.yaml` (superseded by `jmeter-performance.yaml`).
  - [ ] Run git status to confirm all 5 dead files are staged for removal.
- **Acceptance Criteria**:
  - Zero extensionless files remain in `.github/workflows/`.
  - All remaining workflow files possess `.yml` or `.yaml` extensions.

### User Story US-AF-112: Pre-Flight Warm-Up Probe Standardization
- **Story Statement**:  
  *As an* Automation Engineer running tests against Render staging in CI,  
  *I want* every staging-facing workflow to execute the 90-second `wait-on` warm-up probe,  
  *So that* tests never fail due to Render free-tier cold-start latency (502/504 errors).
- **Story Points**: 1 SP (Small)
- **Technical Subtasks**:
  - [ ] Inspect `.github/workflows/playwright-ci.yml`, `playwright-docker.yml`, and `jmeter-performance.yaml`.
  - [ ] Verify each job targeting staging includes the standardized probe:
    ```yaml
    - name: Render Staging Warm-Up Pre-Flight Probe
      run: |
        curl -s -o /dev/null https://buggy-books.onrender.com/api/books || true
        curl -s -o /dev/null https://buggy-books-fe.onrender.com/ || true
        npx wait-on -t 90000 https://buggy-books.onrender.com/api/books
        npx wait-on -t 90000 https://buggy-books-fe.onrender.com/
    ```
  - [ ] Verify single Google Chrome browser flags (`channel: 'chrome'`) in all workflow test commands.
- **Acceptance Criteria**:
  - Every workflow interacting with Render executes the warm-up probe before tests start.
  - Zero test runs suffer from initial Render cold-start timeouts.

---

## 3. Definition of Done & Quality Gates

- [ ] All 4 extensionless workflow files are removed.
- [ ] `performance-crud.yaml` is deleted.
- [ ] Remaining workflows (`playwright-ci.yml`, `playwright-docker.yml`, `jmeter-performance.yaml`) pass YAML syntax validation.
- [ ] No workflow runs multiple browsers (Chrome only).

---

## 4. Sprint Velocity & Deliverables Summary

| Artifact / File | Type | Target State / Description |
| :--- | :--- | :--- |
| `.github/workflows/` | Directory | Clean directory containing only valid `.yml` files. |
| `.github/workflows/playwright-ci.yml` | Workflow | Updated with warm-up probe and strict Chrome channel. |
| `.github/workflows/jmeter-performance.yaml` | Workflow | Retained as the sole Apache JMeter performance pipeline. |

---

**Next Steps**: Proceed to [Sprint 1.2: Standardized Environment Templates & Visual Baseline Calibration](sprint_1_2_standardized_env_templates_and_visual_baseline_calibration.md).
