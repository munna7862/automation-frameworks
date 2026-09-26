# AutomationFrameworks — Strategic Planning & Delivery Roadmap

This directory houses the complete engineering roadmap, architectural decomposition, and sprint-by-sprint execution specifications for transforming the `AutomationFrameworks` monorepo into an enterprise-grade multi-framework test automation ecosystem.

---

## 🗺️ Planning Architecture & Directory Structure

```text
planning/
├── Master/
│   └── master_plan.md                 # Strategic Master Plan & 10 Transformation Pillars
│
├── Phases/
│   ├── phase_1_monorepo_foundations_pipeline_hygiene_and_utility_unification.md
│   ├── phase_2_documentation_integrity_anti_pattern_manual_and_quality_gates.md
│   ├── phase_3_webdriverio_and_selenium_alignment_to_buggybooks.md
│   ├── phase_4_mobile_automation_appium_and_webdriverio.md
│   └── phase_5_executive_observability_and_unified_allure_dashboard.md
│
├── Sprints/
│   ├── sprint_1_1_workflow_cleanup_and_extensionless_file_purge.md
│   ├── sprint_1_2_standardized_env_templates_and_visual_baseline_calibration.md
│   ├── sprint_1_3_monorepo_workspaces_and_utility_unification.md
│   ├── sprint_2_1_intentional_bugs_and_chaos_testing_guide.md
│   ├── sprint_2_2_dual_engine_performance_strategy_and_k6_migration.md
│   ├── sprint_2_3_unified_pull_request_ci_quality_gate.md
│   ├── sprint_3_1_buggybooks_selenium_page_objects_and_auth_catalog_smoke.md
│   ├── sprint_3_2_buggybooks_wdio_page_objects_and_cart_checkout_flows.md
│   ├── sprint_3_3_cross_framework_parity_assertions_and_traceability_matrix_sync.md
│   ├── sprint_4_1_mobile_automation_monorepo_import_and_scaffolding.md
│   ├── sprint_4_2_appium_android_ios_smoke_and_chaos_e2e_verification.md
│   ├── sprint_4_3_mobile_ci_pipeline_and_emulator_execution_workflows.md
│   ├── sprint_5_1_multi_framework_allure_result_aggregation_architecture.md
│   ├── sprint_5_2_github_pages_portal_landing_page_and_kpi_badging.md
│   └── sprint_5_3_automated_monorepo_health_auditing_and_closed_loop_governance.md
│
└── README.md                          # Executive index (this document)
```

---

## 🏛️ Strategic Master Plan Overview

👉 [**`planning/Master/master_plan.md`**](file:///c:/Workspace/AutomationFrameworks/planning/Master/master_plan.md)

The Master Plan establishes the foundational principles, target architecture, and 10 transformation pillars:
1. **Pillar 1**: Multi-Framework BuggyBooks Parity (Selenium + WebdriverIO).
2. **Pillar 2**: Monorepo Workspaces & `playwright-utils` Package Unification (`@automationframeworks/playwright-utils`).
3. **Pillar 3**: Mobile Test Automation Suite (Appium 2.x + WebdriverIO).
4. **Pillar 4**: Intentional Bugs & Chaos Testing Guide (`docs/intentional_bugs.md`).
5. **Pillar 5**: CI/CD Workflow Modernization & Pipeline Hygiene.
6. **Pillar 6**: Standardized Environment Configuration Templates (`.env.example`).
7. **Pillar 7**: Visual Regression Snapshot Calibration for Project `chrome`.
8. **Pillar 8**: Dual-Engine Performance Strategy (Apache JMeter + k6 Synergy).
9. **Pillar 9**: Unified Pull Request Quality Gate (`pr-gate.yml`).
10. **Pillar 10**: Centralized Multi-Framework Allure Reporting on GitHub Pages.

---

## 📅 The 5 Delivery Phases & 15 Sprints

| Phase & Specification | Theme & Scope | Associated Sprints |
| :--- | :--- | :--- |
| **[Phase 1](file:///c:/Workspace/AutomationFrameworks/planning/Phases/phase_1_monorepo_foundations_pipeline_hygiene_and_utility_unification.md)** | **Foundations, Pipeline Hygiene & Utility Unification** | • [Sprint 1.1: Workflow Cleanup & Extensionless Purge](file:///c:/Workspace/AutomationFrameworks/planning/Sprints/sprint_1_1_workflow_cleanup_and_extensionless_file_purge.md)<br>• [Sprint 1.2: Env Templates & Visual Calibration](file:///c:/Workspace/AutomationFrameworks/planning/Sprints/sprint_1_2_standardized_env_templates_and_visual_baseline_calibration.md)<br>• [Sprint 1.3: Monorepo Workspaces & Package Unification](file:///c:/Workspace/AutomationFrameworks/planning/Sprints/sprint_1_3_monorepo_workspaces_and_utility_unification.md) |
| **[Phase 2](file:///c:/Workspace/AutomationFrameworks/planning/Phases/phase_2_documentation_integrity_anti_pattern_manual_and_quality_gates.md)** | **Documentation Integrity, Chaos Manual & Quality Gates** | • [Sprint 2.1: Intentional Bugs & Chaos Guide](file:///c:/Workspace/AutomationFrameworks/planning/Sprints/sprint_2_1_intentional_bugs_and_chaos_testing_guide.md)<br>• [Sprint 2.2: Dual-Engine Performance & k6 Migration](file:///c:/Workspace/AutomationFrameworks/planning/Sprints/sprint_2_2_dual_engine_performance_strategy_and_k6_migration.md)<br>• [Sprint 2.3: Unified PR CI Quality Gate (pr-gate.yml)](file:///c:/Workspace/AutomationFrameworks/planning/Sprints/sprint_2_3_unified_pull_request_ci_quality_gate.md) |
| **[Phase 3](file:///c:/Workspace/AutomationFrameworks/planning/Phases/phase_3_webdriverio_and_selenium_alignment_to_buggybooks.md)** | **WebdriverIO & Selenium Alignment to BuggyBooks** | • [Sprint 3.1: Selenium Page Objects & Auth/Catalog Smoke](file:///c:/Workspace/AutomationFrameworks/planning/Sprints/sprint_3_1_buggybooks_selenium_page_objects_and_auth_catalog_smoke.md)<br>• [Sprint 3.2: WDIO Page Objects & Cart/Checkout Flows](file:///c:/Workspace/AutomationFrameworks/planning/Sprints/sprint_3_2_buggybooks_wdio_page_objects_and_cart_checkout_flows.md)<br>• [Sprint 3.3: Cross-Framework Parity & Catalog Sync](file:///c:/Workspace/AutomationFrameworks/planning/Sprints/sprint_3_3_cross_framework_parity_assertions_and_traceability_matrix_sync.md) |
| **[Phase 4](file:///c:/Workspace/AutomationFrameworks/planning/Phases/phase_4_mobile_automation_appium_and_webdriverio.md)** | **Mobile Automation (Appium 2.x + WebdriverIO)** | • [Sprint 4.1: Mobile Automation Monorepo Import](file:///c:/Workspace/AutomationFrameworks/planning/Sprints/sprint_4_1_mobile_automation_monorepo_import_and_scaffolding.md)<br>• [Sprint 4.2: Appium Android/iOS Smoke & Chaos E2E](file:///c:/Workspace/AutomationFrameworks/planning/Sprints/sprint_4_2_appium_android_ios_smoke_and_chaos_e2e_verification.md)<br>• [Sprint 4.3: Mobile CI Pipeline & Emulator Workflows](file:///c:/Workspace/AutomationFrameworks/planning/Sprints/sprint_4_3_mobile_ci_pipeline_and_emulator_execution_workflows.md) |
| **[Phase 5](file:///c:/Workspace/AutomationFrameworks/planning/Phases/phase_5_executive_observability_and_unified_allure_dashboard.md)** | **Executive Observability & Unified Allure Dashboard** | • [Sprint 5.1: Multi-Framework Allure Aggregation](file:///c:/Workspace/AutomationFrameworks/planning/Sprints/sprint_5_1_multi_framework_allure_result_aggregation_architecture.md)<br>• [Sprint 5.2: GitHub Pages Portal Landing Page](file:///c:/Workspace/AutomationFrameworks/planning/Sprints/sprint_5_2_github_pages_portal_landing_page_and_kpi_badging.md)<br>• [Sprint 5.3: Automated Health & Governance](file:///c:/Workspace/AutomationFrameworks/planning/Sprints/sprint_5_3_automated_monorepo_health_auditing_and_closed_loop_governance.md) |

---

## 👥 Virtual Sprint Team Matrix

Every sprint is executed through a specialized 6-agent persona team defined in `.agents/skills/`:

```
               ┌────────────────────────────────────────────────────────┐
               │              Virtual Sprint Team (6 Roles)             │
               └──────────────────────────┬─────────────────────────────┘
                                          │
       ┌──────────────────┬───────────────┼───────────────┬──────────────────┐
       ▼                  ▼               ▼               ▼                  ▼
┌──────────────┐   ┌──────────────┐┌──────────────┐┌──────────────┐   ┌──────────────┐
│SDET Architect│   │Playwright QA ││ Selenium QA  ││  Mobile QA   │   │ Performance  │
│  (Lead / DoD)│   │(Chrome + API)││ (WebDriver)  ││ (Appium 2.x) │   │ (JMeter + k6)│
└──────┬───────┘   └──────┬───────┘└──────┬───────┘└──────┬───────┘   └──────┬───────┘
       │                  │               │               │                  │
       └──────────────────┴───────────────┼───────────────┴──────────────────┘
                                          │
                               ┌──────────▼──────────┐
                               │ DevOps & Release    │
                               │ (CI/CD + PR Gates)  │
                               └─────────────────────┘
```

1. [**`role-sdet-architect`**](file:///c:/Workspace/AutomationFrameworks/.agents/skills/role-sdet-architect/SKILL.md): Strategy, dual-catalog sync, monorepo workspaces, Quality Gates.
2. [**`role-playwright-automation`**](file:///c:/Workspace/AutomationFrameworks/.agents/skills/role-playwright-automation/SKILL.md): Google Chrome UI + API specs, POMs, self-healing, visual regression.
3. [**`role-selenium-specialist`**](file:///c:/Workspace/AutomationFrameworks/.agents/skills/role-selenium-specialist/SKILL.md): Selenium WebDriver TypeScript, BuggyBooks POMs, ChromeDriver headless, Shadow DOM.
4. [**`role-mobile-appium-specialist`**](file:///c:/Workspace/AutomationFrameworks/.agents/skills/role-mobile-appium-specialist/SKILL.md): Appium 2.x + WebdriverIO, Screen Objects, gestures, mobile chaos.
5. [**`role-performance-engineer`**](file:///c:/Workspace/AutomationFrameworks/.agents/skills/role-performance-engineer/SKILL.md): Apache JMeter 5.6+ enterprise stress plans and k6 baseline drift gates.
6. [**`role-devops-engineer`**](file:///c:/Workspace/AutomationFrameworks/.agents/skills/role-devops-engineer/SKILL.md): CI/CD pipelines, Render warm-up probes, Allure Pages deployment, PR release lifecycle.
