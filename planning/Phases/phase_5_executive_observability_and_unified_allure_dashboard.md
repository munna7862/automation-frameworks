# Phase 5: Executive Observability & Unified Allure Dashboard

**Navigation**: [🗺️ Planning Hub](../README.md) | [📖 Master Plan](../Master/master_plan.md) | [Phase 1](phase_1_monorepo_foundations_pipeline_hygiene_and_utility_unification.md) | [Phase 2](phase_2_documentation_integrity_anti_pattern_manual_and_quality_gates.md) | [Phase 3](phase_3_webdriverio_and_selenium_alignment_to_buggybooks.md) | [Phase 4](phase_4_mobile_automation_appium_and_webdriverio.md) | **[Phase 5]** | [Phase 6 ➡️](phase_6_cicd_integrity_and_supply_chain_security.md)

**Phase Identifier**: `PHASE-5-EXECUTIVE-OBSERVABILITY`  
**Phase Status**: Completed  
**Total Phase Velocity**: **13 Story Points** (Sprint 5.1: 4 SP, Sprint 5.2: 5 SP, Sprint 5.3: 4 SP)  
**Phase Leads**: SDET Architect & DevOps Engineer  
**Primary Personas**: SDET Architect, DevOps Engineer, Playwright QA Lead, Performance Engineer  

---

## 1. Executive Summary & Phase Theme

The crowning achievement of the `AutomationFrameworks` monorepo is the realization of **Executive Observability**. While each automation framework produces its own test execution artifacts, stakeholders, engineering leads, and QA managers currently lack a single, unified view of overall application health across all disciplines.

Presently:
1. Playwright reports are deployed to GitHub Pages under an isolated subpath (`AutomationReports/CI/<run_number>`), while JMeter reports are stored as unrendered workflow artifacts, and Selenium/WDIO/Mobile test results are not published at all.
2. There is no central landing page on GitHub Pages synthesizing pass/fail statistics, execution duration trends, and framework comparison benchmarks.
3. Flaky test quarantine tracking and dual-catalog synchronization are enforced manually rather than validated through automated CI health audits.

**Phase 5** establishes a state-of-the-art, centralized reporting portal hosted on GitHub Pages:
- **Central Landing Hub (`index.html`)**: A modern, glassmorphic executive dashboard displaying real-time build badges, latest execution timestamps, pass/fail doughnut charts, and direct navigation links to each sub-framework report.
- **Unified Artifact Aggregation**: GitHub Actions workflows publish structured Allure results into dedicated namespaces:
  - `https://munna7862.github.io/automation-frameworks/AutomationReports/Playwright/`
  - `https://munna7862.github.io/automation-frameworks/AutomationReports/JMeter/`
  - `https://munna7862.github.io/automation-frameworks/AutomationReports/Selenium/`
  - `https://munna7862.github.io/automation-frameworks/AutomationReports/WDIO/`
  - `https://munna7862.github.io/automation-frameworks/AutomationReports/Mobile/`
  - `https://munna7862.github.io/automation-frameworks/AutomationReports/k6/`
- **Closed-Loop Governance**: Automated CI health audits validating dual-catalog parity (`verify-catalog-sync.ts`) and quarantine test aging (`quarantine-audit.yml`).

---

## 2. Architectural Scope & Target Outcomes

| Subsystem / Workstream | Current State / Defect | Phase Target Outcome |
| :--- | :--- | :--- |
| **Executive Reporting Portal** | No landing page exists on GitHub Pages; users must know obscure run URLs to view reports. | Beautiful, interactive `index.html` landing page on GitHub Pages with summary KPIs, framework cards, and direct deep-links. |
| **Allure Report Namespacing** | Reports overwrite or scatter across arbitrary paths without cross-framework organization. | Standardized directory tree on `gh-pages` branch partitioning reports by framework while preserving historical trend data. |
| **Performance Visual Reports** | Apache JMeter HTML dashboards and k6 summaries are trapped in workflow run zip files. | Automatically published and linked in the central GitHub Pages portal under `/JMeter/` and `/k6/`. |
| **Dual Catalog Governance** | Synchronization between `docs/` and `playwright-e2e/` catalogs relies on human vigilance. | Automated CI validator script (`scripts/verify-catalog-sync.ts`) failing PRs if tables differ by a single character. |
| **Quarantine De-Flake Loop** | Quarantined tests remain skipped indefinitely without tracking or de-quarantine triggers. | Automated weekly audit (`quarantine-audit.yml`) running quarantined tests 10x to measure flakiness and report health. |

---

## 3. Sprints in this Phase

```mermaid
graph LR
    S51[Sprint 5.1: Multi-Framework Allure Aggregation (4 SP)] --> S52[Sprint 5.2: GitHub Pages Portal & Badging (5 SP)]
    S52 --> S53[Sprint 5.3: Automated Health & Governance (4 SP)]
```

### Sprint Breakdown

1. **[Sprint 5.1: Multi-Framework Allure Result Aggregation Architecture](../Sprints/sprint_5_1_multi_framework_allure_result_aggregation_architecture.md)**
   - *Estimated Effort*: 4 Story Points
   - *Target Pillars*: Pillar 10 (Centralized Multi-Framework Allure Reporting)
   - *Key Deliverables*:
     - Standardizing Allure results output directory across all frameworks:
       - Playwright: `playwright-e2e/allure-results/`
       - Selenium: `selenium-e2e/allure-results/`
       - WebdriverIO: `wdio-e2e/allure-results/`
       - Mobile: `mobile-automation/allure-results/`
     - Enhancing `.github/workflows/playwright-ci.yml`, `selenium-ci.yml`, and `wdio-ci.yml` with structured Allure generation and gh-pages publishing actions (`peaceiris/actions-gh-pages@v3` with `keep_files: true`).
     - Preserving historical trend files (`history/` folder injection) across multi-run deployments.
   - *Verification*: CI runs deploy Allure reports into dedicated paths on `gh-pages` without clobbering existing directories.

2. **[Sprint 5.2: GitHub Pages Portal Landing Page & Executive KPI Badging](../Sprints/sprint_5_2_github_pages_portal_landing_page_and_kpi_badging.md)**
   - *Estimated Effort*: 5 Story Points
   - *Target Pillars*: Pillar 10 (Centralized Multi-Framework Allure Reporting)
   - *Key Deliverables*:
     - Authoring `docs/portal/index.html` (deployed to root of GitHub Pages):
       - Premium modern UI (Tailwind or glassmorphic CSS, dark theme, responsive grid).
       - Framework summary cards (Playwright, JMeter, Selenium, WebdriverIO, Mobile, k6).
       - Status badges (Latest Run, Pass Rate, Total Tests, Duration).
       - Interactive search and quick-filter by framework type (Web, API, Mobile, Performance).
     - Automated metadata generator script (`scripts/generate-portal-metadata.js`) extracting latest run metrics from Allure summary JSONs and generating `portal-data.json`.
     - Publishing pipeline deployed on every CI completion.
   - *Verification*: GitHub Pages root URL loads dashboard cleanly; all framework cards link directly to functioning reports.

3. **[Sprint 5.3: Automated Monorepo Health Auditing & Closed-Loop Governance](../Sprints/sprint_5_3_automated_monorepo_health_auditing_and_closed_loop_governance.md)**
   - *Estimated Effort*: 4 Story Points
   - *Target Pillars*: Pillar 5 (CI Modernization) & Pillar 10 (Governance)
   - *Key Deliverables*:
     - Creating `scripts/verify-catalog-sync.ts` asserting strict byte-for-byte parity between `docs/test_cases_catalog.md` and `playwright-e2e/test_cases_catalog.md`.
     - Implementing `.github/workflows/quarantine-audit.yml`:
       - Scheduled cron job scanning for tests tagged with `@quarantine` or `test.fixme`.
       - Running quarantined tests 10 iterations to generate flakiness distribution statistics.
       - Opening automated GitHub issues or PR comments recommending de-quarantine if pass rate is 100%.
     - Enforcing catalog validation inside `.github/workflows/pr-gate.yml`.
   - *Verification*: Intentionally introducing a discrepancy in catalog files triggers an immediate exit 1 in `npm run test:verify-catalog`.

---

## 4. Definition of Done & Quality Acceptance Gates

- [x] GitHub Pages root URL serves the interactive executive observability portal (`index.html`).
- [x] Dedicated sub-reports for Playwright, JMeter, Selenium, WebdriverIO, Mobile, and k6 are active and linked.
- [x] Allure history is preserved across runs, showing historical pass-rate trends.
- [x] `scripts/verify-catalog-sync.ts` runs automatically in CI and prevents catalog drift.
- [x] `quarantine-audit.yml` is scheduled and successfully detects quarantined tests.
- [x] Monorepo documentation provides complete architecture diagrams and links to live dashboards.

---

## 5. Risks, Gotchas & Mitigation Strategies

| Threat / Gotcha | Impact | Mitigation Strategy |
| :--- | :--- | :--- |
| **GitHub Pages Overwrite Race Condition** | Concurrent CI runs for different frameworks overwrite `gh-pages` branch simultaneously. | Implement concurrency groups with `cancel-in-progress: false` or use mutex locks/retry logic in deployment steps. |
| **Allure History Directory Bloat** | Unchecked accumulation of old report artifacts exceeds GitHub Pages repository storage limits. | Maintain retention policy script keeping only the last 20 historical runs per framework. |
| **Broken Deep-Links on Non-Default Branches** | Branch deployments generate relative links that break when accessed from base URL. | Use strict relative pathing (`./Playwright/`, `./JMeter/`) and configurable base href tags. |
