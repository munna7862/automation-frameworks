# Sprint 5.1: Multi-Framework Allure Result Aggregation Architecture

**Navigation**: [⬅️ Previous: Sprint 4.3](sprint_4_3_mobile_ci_pipeline_and_emulator_execution_workflows.md) | [🗺️ Planning Hub](../README.md) | **Sprint 5.1** | [➡️ Next: Sprint 5.2](sprint_5_2_github_pages_portal_landing_page_and_kpi_badging.md)

**Sprint Identifier**: `SPRINT-5.1-ALLURE-AGGREGATION-ARCHITECTURE`  
**Phase Mapping**: [Phase 5: Executive Observability & Unified Allure Dashboard](../Phases/phase_5_executive_observability_and_unified_allure_dashboard.md)  
**Estimated Velocity**: 4 Story Points  
**Sprint Status**: In Progress  
**Sprint Goal**: Establish a standardized Allure results generation and namespaced publishing architecture across Playwright, JMeter, Selenium, WebdriverIO, and Mobile, preserving historical trend data on the `gh-pages` branch.

---

## 1. Persona Roles & Ownership Matrix

| Persona | Assigned Member | Responsibilities for this Sprint |
| :--- | :--- | :--- |
| **DevOps Engineer** | AI Agent / DevOps | Architecting GitHub Pages multi-framework deployment actions, managing `peaceiris/actions-gh-pages`, and directory namespacing. |
| **SDET Architect** | AI Agent / SDET | Defining directory structures, ensuring historical trend persistence (`history/`), and auditing Allure configs. |
| **Playwright QA Lead** | AI Agent / QA | Verifying Playwright Allure reporter integration and Monocart HTML report packaging. |

---

## 2. Sprint Backlog & Granular User Stories

### User Story US-AF-511: Cross-Framework Allure Configuration Standardization
- **Story Statement**:  
  *As an* SDET,  
  *I want* consistent Allure reporting configured across all test frameworks,  
  *So that* test execution steps, attachments, and failure stack traces are captured uniformly.
- **Story Points**: 2 SP (Medium)
- **Technical Subtasks**:
  - [x] Verify Allure reporters in:
    - `playwright-e2e`: `allure-playwright` generating to `playwright-e2e/allure-results/`.
    - `selenium-e2e`: Mocha Allure reporter generating to `selenium-e2e/allure-results/`.
    - `wdio-e2e`: `@wdio/allure-reporter` generating to `wdio-e2e/allure-results/`.
    - `mobile-automation`: WebdriverIO Allure reporter generating to `mobile-automation/allure-results/`.
  - [x] Standardize environment metadata generation (`environment.properties`) capturing framework version, OS, browser channel (`chrome`), and staging URL.
- **Acceptance Criteria**:
  - Running any framework generates standardized JSON/XML results in its local `allure-results/` folder.
  - Environment details display cleanly in Allure metadata tab.

### User Story US-AF-512: Namespaced GitHub Pages Deployment Pipeline
- **Story Statement**:  
  *As a* DevOps Engineer,  
  *I want* CI workflows to deploy reports into dedicated subdirectories on GitHub Pages without overwriting other framework reports,  
  *So that* all frameworks maintain live reports under one single domain.
- **Story Points**: 2 SP (Medium)
- **Technical Subtasks**:
  - [x] Standardize deployment directory hierarchy on `gh-pages`:
    ```text
    AutomationReports/
    ├── Playwright/
    ├── JMeter/
    ├── Selenium/
    ├── WDIO/
    ├── Mobile/
    └── k6/
    ```
  - [x] Configure `peaceiris/actions-gh-pages@v3` with `keep_files: true` and `destination_dir: AutomationReports/<framework>`.
  - [x] Implement history preservation by pulling previous `history/` directories from `gh-pages` before report generation.
- **Acceptance Criteria**:
  - Deploying a Playwright report does not overwrite existing JMeter or Selenium reports.
  - Allure trend charts correctly show historical pass-rate trends across builds.

---

## 3. Definition of Done & Quality Gates

- [x] All 4 web and mobile frameworks produce valid Allure result outputs.
- [x] `gh-pages` branch architecture cleanly partitions reports by framework.
- [x] History retention logic verified; trend charts display consecutive run data.
- [x] CI deployment uses `keep_files: true` to prevent data loss.

---

## 4. Sprint Velocity & Deliverables Summary

| Artifact / File | Type | Target State / Description |
| :--- | :--- | :--- |
| `.github/workflows/` | Workflows | Updated deployment jobs with namespaced GitHub Pages targets. |
| `allure-results/` | Output Dirs | Standardized output across all framework directories. |
| `docs/architecture/reporting_architecture.md` | Architecture | Comprehensive Allure and GitHub Pages deployment guide. |

---

**Next Steps**: Proceed to [Sprint 5.2: GitHub Pages Portal Landing Page & Executive KPI Badging](sprint_5_2_github_pages_portal_landing_page_and_kpi_badging.md).
