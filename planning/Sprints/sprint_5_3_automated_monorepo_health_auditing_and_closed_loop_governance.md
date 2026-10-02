# Sprint 5.3: Automated Monorepo Health Auditing & Closed-Loop Governance

**Navigation**: [⬅️ Previous: Sprint 5.2](sprint_5_2_github_pages_portal_landing_page_and_kpi_badging.md) | [🗺️ Planning Hub](../README.md) | **Sprint 5.3 (Final Milestone)**

**Sprint Identifier**: `SPRINT-5.3-HEALTH-AUDITING-AND-GOVERNANCE`  
**Phase Mapping**: [Phase 5: Executive Observability & Unified Allure Dashboard](../Phases/phase_5_executive_observability_and_unified_allure_dashboard.md)  
**Estimated Velocity**: 4 Story Points  
**Sprint Status**: Completed  
**Sprint Goal**: Implement automated health auditing tools including a byte-for-byte dual-catalog parity verifier (`scripts/verify-catalog-sync.ts`) and a scheduled closed-loop quarantine audit pipeline (`quarantine-audit.yml`) to maintain monorepo hygiene over time.

---

## 1. Persona Roles & Ownership Matrix

| Persona | Assigned Member | Responsibilities for this Sprint |
| :--- | :--- | :--- |
| **SDET Architect** | AI Agent / SDET | Developing `verify-catalog-sync.ts`, defining quarantine governance rules, and authoring health checklists. |
| **DevOps Engineer** | AI Agent / DevOps | Implementing `.github/workflows/quarantine-audit.yml` and embedding catalog verification in `pr-gate.yml`. |
| **Playwright QA Lead** | AI Agent / QA | Managing quarantined tests, monitoring flaky rates, and reviewing de-quarantine pull requests. |

---

## 2. Sprint Backlog & Granular User Stories

### User Story US-AF-531: Automated Dual-Catalog Parity Validator
- **Story Statement**:  
  *As an* SDET Architect,  
  *I want* an automated script that verifies `docs/test_cases_catalog.md` and `playwright-e2e/test_cases_catalog.md` are 100% identical,  
  *So that* documentation drift between the central catalog and the Playwright duplicate is mechanically prevented in CI.
- **Story Points**: 2 SP (Medium)
- **Technical Subtasks**:
  - [x] Author `scripts/verify-catalog-sync.ts`:
    - Reads both `docs/test_cases_catalog.md` and `playwright-e2e/test_cases_catalog.md`.
    - Normalizes line endings (`\r\n` $\rightarrow$ `\n`).
    - Compares content; if differences exist, prints a readable diff and exits with code `1`.
  - [x] Add npm script to root `package.json`:
    ```json
    "test:verify-catalog": "tsx scripts/verify-catalog-sync.ts"
    ```
  - [x] Add `test:verify-catalog` check to `.github/workflows/pr-gate.yml`.
- **Acceptance Criteria**:
  - Script passes when files match; fails with informative diff if any line differs.
  - PR gate blocks merges that fail catalog synchronization.

### User Story US-AF-532: Closed-Loop Quarantine Audit Pipeline
- **Story Statement**:  
  *As a* QA Lead,  
  *I want* a scheduled workflow that repeatedly runs quarantined tests,  
  *So that* flaky tests that have stabilized can be identified and safely reintroduced into the main regression suite.
- **Story Points**: 2 SP (Medium)
- **Technical Subtasks**:
  - [x] Author `.github/workflows/quarantine-audit.yml`:
    - Scheduled weekly (`cron: '0 2 * * 1'`) and dispatchable manually.
    - Runs pre-flight staging warm-up probe.
    - Filters specs tagged with `@quarantine` or `test.fixme`.
    - Executes quarantined tests with `--repeat-each=10`.
    - Generates a pass/fail stability ratio table in GitHub Step Summary.
    - Recommends de-quarantine for any test achieving 10/10 green runs.
- **Acceptance Criteria**:
  - Workflow runs quarantined tests across 10 iterations without affecting main CI.
  - Step Summary clearly reports flakiness percentage for each quarantined test.

---

## 3. Definition of Done & Quality Gates

- [x] `scripts/verify-catalog-sync.ts` authored, tested, and passing.
- [x] Catalog verification integrated into `.github/workflows/pr-gate.yml`.
- [x] `.github/workflows/quarantine-audit.yml` active and syntax-validated.
- [x] Documentation updated with quarantine lifecycle guidelines (`docs/quarantine_lifecycle_guide.md`).

---

## 4. Sprint Velocity & Deliverables Summary

| Artifact / File | Type | Target State / Description |
| :--- | :--- | :--- |
| `scripts/verify-catalog-sync.ts` | CLI Script | Automated byte-for-byte dual-catalog parity verifier. |
| `.github/workflows/quarantine-audit.yml` | Workflow | Scheduled 10x repetition audit for quarantined tests. |
| `docs/quarantine_lifecycle_guide.md` | Guide | Formal quarantine governance, SLAs, and de-quarantine protocol. |
| `package.json` | Config | Root script `npm run test:verify-catalog` configured. |

---

**Milestone Completion**: This concludes the 15-sprint engineering roadmap, achieving full multi-framework transformation across 63 Story Points. Return to [Planning & Sprint Sitemap](../README.md) or [Strategic Master Plan](../Master/master_plan.md).
