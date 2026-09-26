# Sprint 5.2: GitHub Pages Portal Landing Page & Executive KPI Badging

**Navigation**: [⬅️ Previous: Sprint 5.1](sprint_5_1_multi_framework_allure_result_aggregation_architecture.md) | [🗺️ Planning Hub](../README.md) | **Sprint 5.2** | [➡️ Next: Sprint 5.3](sprint_5_3_automated_monorepo_health_auditing_and_closed_loop_governance.md)

**Sprint Identifier**: `SPRINT-5.2-GITHUB-PAGES-PORTAL-LANDING-PAGE`  
**Phase Mapping**: [Phase 5: Executive Observability & Unified Allure Dashboard](../Phases/phase_5_executive_observability_and_unified_allure_dashboard.md)  
**Estimated Velocity**: 5 Story Points  
**Sprint Status**: Planned  
**Sprint Goal**: Create a state-of-the-art executive reporting portal (`index.html`) deployed to the root of GitHub Pages, featuring interactive framework cards, real-time KPI metrics, and direct links to sub-framework Allure and JMeter dashboards.

---

## 1. Persona Roles & Ownership Matrix

| Persona | Assigned Member | Responsibilities for this Sprint |
| :--- | :--- | :--- |
| **SDET Architect** | AI Agent / SDET | Designing portal layout, executive KPIs, and automated metrics aggregator script (`generate-portal-metadata.js`). |
| **DevOps Engineer** | AI Agent / DevOps | Integrating portal build and deployment into CI release pipelines. |
| **Playwright QA Lead** | AI Agent / QA | Reviewing test metrics presentation and verifying deep-link routing. |

---

## 2. Sprint Backlog & Granular User Stories

### User Story US-AF-521: Executive Portal UI Design & Implementation
- **Story Statement**:  
  *As an* Engineering Executive or QA Director,  
  *I want* a clean, centralized landing page at the root of GitHub Pages,  
  *So that* I can evaluate overall quality health at a glance without navigating multiple disconnected URLs.
- **Story Points**: 3 SP (Medium-Large)
- **Technical Subtasks**:
  - [ ] Author `docs/portal/index.html`:
    - Modern dark-themed CSS styling with responsive grid layout.
    - Executive KPI Cards: Total Test Count (~130+), Multi-Framework Coverage (6 Suites), Target Environment (BuggyBooks Staging).
    - Framework Tiles:
      - **Playwright E2E & API**: Pass rate, duration, link to `/AutomationReports/Playwright/`.
      - **Apache JMeter Performance**: P95 SLA, concurrency, link to `/AutomationReports/JMeter/`.
      - **Selenium WebDriver**: Pass rate, Chrome UI status, link to `/AutomationReports/Selenium/`.
      - **WebdriverIO**: Pass rate, Shadow DOM status, link to `/AutomationReports/WDIO/`.
      - **Appium Mobile**: Android emulator status, link to `/AutomationReports/Mobile/`.
      - **k6 Performance**: Latency drift rate, link to `/AutomationReports/k6/`.
    - Live Status Badges and commit/timestamp details.
- **Acceptance Criteria**:
  - `index.html` renders cleanly across mobile and desktop viewports.
  - All cards link correctly to relative subpaths.

### User Story US-AF-522: Automated Portal Metadata Aggregator Script
- **Story Statement**:  
  *As a* CI Runner deploying test results,  
  *I want* an automated Node.js script that parses Allure and JMeter output summaries into `portal-data.json`,  
  *So that* the portal UI dynamically updates with actual test execution metrics on every build.
- **Story Points**: 2 SP (Medium)
- **Technical Subtasks**:
  - [ ] Author `scripts/generate-portal-metadata.js`:
    - Reads `widgets/summary.json` from each framework's generated report.
    - Extracts `passed`, `failed`, `skipped`, `total`, and `duration`.
    - Generates `docs/portal/portal-data.json`.
  - [ ] Add client-side JavaScript in `index.html` to fetch `portal-data.json` and dynamically hydrate badges and counters.
  - [ ] Add GitHub Actions step deploying `docs/portal/` to root of `gh-pages`.
- **Acceptance Criteria**:
  - Running script generates valid JSON data.
  - Portal displays dynamic, accurate numbers from latest test executions.

---

## 3. Definition of Done & Quality Gates

- [ ] `docs/portal/index.html` authored and verified locally.
- [ ] `scripts/generate-portal-metadata.js` accurately parses Allure summary outputs.
- [ ] Root GitHub Pages URL renders executive portal cleanly.
- [ ] All framework deep-links navigate to functioning sub-reports.

---

## 4. Sprint Velocity & Deliverables Summary

| Artifact / File | Type | Target State / Description |
| :--- | :--- | :--- |
| `docs/portal/index.html` | Web UI | Executive landing dashboard for GitHub Pages. |
| `scripts/generate-portal-metadata.js` | Script | Metrics aggregator script extracting latest run data. |
| `docs/portal/portal-data.json` | Data | Dynamic metrics feed consumed by portal dashboard. |

---

**Next Steps**: Proceed to [Sprint 5.3: Automated Monorepo Health Auditing & Closed-Loop Governance](sprint_5_3_automated_monorepo_health_auditing_and_closed_loop_governance.md).
