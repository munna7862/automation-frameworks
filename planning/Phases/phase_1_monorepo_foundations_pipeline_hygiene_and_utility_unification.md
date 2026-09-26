# Phase 1: Monorepo Foundations, Pipeline Hygiene & Utility Unification

**Navigation**: [🗺️ Planning Hub](../README.md) | [📖 Master Plan](../Master/master_plan.md) | **[Phase 1]** | [Phase 2](phase_2_documentation_integrity_anti_pattern_manual_and_quality_gates.md) | [Phase 3](phase_3_webdriverio_and_selenium_alignment_to_buggybooks.md) | [Phase 4](phase_4_mobile_automation_appium_and_webdriverio.md) | [Phase 5](phase_5_executive_observability_and_unified_allure_dashboard.md)

**Phase Identifier**: `PHASE-1-FOUNDATIONS-AND-PIPELINES`  
**Phase Status**: Planned  
**Total Phase Velocity**: **10 Story Points** (Sprint 1.1: 2 SP, Sprint 1.2: 3 SP, Sprint 1.3: 5 SP)  
**Phase Leads**: SDET Architect & DevOps Engineer  
**Primary Personas**: SDET Architect, Playwright QA Lead, DevOps Engineer  

---

## 1. Executive Summary & Phase Theme

The primary objective of **Phase 1** is to establish an unshakeable operational and structural foundation for the entire `AutomationFrameworks` monorepo. 

During our initial repository audit and comparative assessment against `buggy-books`, several critical structural liabilities were discovered:
1. **Pipeline Clutter and Extensionless Artifacts**: `.github/workflows/` contains 4 dead, extensionless files (`Playwright Automation CI (Sharded)`, etc.) that fail syntax parsing and confuse CI dispatch engines. Furthermore, a legacy `performance-crud.yaml` duplicates Apache JMeter execution without adhering to the single-browser or SLA standards.
2. **Configuration Ambiguity & Missing `.env.example` Templates**: Developers and CI runners have no unified documentation for mandatory environment variables across test frameworks (`BASE_URL`, `API_BASE_URL`, `BROWSER`, `ELEMENT_TIMEOUT`, `JWT_SECRET`).
3. **Visual Regression Golden Snapshot Inconsistencies**: The `Test_010_VisualRegressionChaos.spec.ts` test requires calibrated golden snapshots specifically for the `chrome` project on Linux and Windows runners to eliminate false-positive diff failures.
4. **Code Duplication & Unlinked Utilities**: A root `playwright-utils/` directory exists in isolation while `playwright-e2e/src/core/base/` duplicates `base.page.ts`, `logger.ts`, and `common.util.ts`. No root package manager coordinates dependencies across frameworks.

**Phase 1** transforms this landscape by purging pipeline debt, standardizing environment configs, calibrating Chrome visual baselines, and establishing an `npm workspaces` monorepo structure with `@automationframeworks/playwright-utils` as a shared workspace package.

---

## 2. Architectural Scope & Target Outcomes

| Subsystem / Workstream | Current State / Defect | Phase Target Outcome |
| :--- | :--- | :--- |
| **CI/CD Workflow Directory** | 4 dead extensionless files and legacy `performance-crud.yaml` lingering in `.github/workflows/`. | Clean directory containing only valid, active, kebab-case `.yml` / `.yaml` workflows with zero syntax errors. |
| **Environment Configuration** | No standardized `.env.example` templates in root, `selenium-e2e/`, `wdio-e2e/`, or `playwright-e2e/`. | Fully documented `.env.example` files in monorepo root and every sub-project with clear defaults for BuggyBooks staging. |
| **Visual Regression Baseline** | Visual snapshot diffs risk failing in CI due to missing calibrated snapshots for Google Chrome (`channel: 'chrome'`). | Golden snapshots generated and committed for `catalog-baseline-chrome-linux.png` and `catalog-baseline-chrome-win32.png`. |
| **Monorepo Architecture** | Frameworks run isolated; duplicated utility code in `playwright-e2e` and unlinked root `playwright-utils/`. | Root `package.json` declaring `workspaces`, linking `packages/playwright-utils` (`@automationframeworks/playwright-utils`) seamlessly. |
| **Root Orchestration Scripts** | No centralized commands to lint, typecheck, or run smoke tests across all packages. | Unified root scripts: `npm run lint:all`, `npm run typecheck:all`, `npm run test:smoke:all`. |

---

## 3. Sprints in this Phase

```mermaid
graph LR
    S11[Sprint 1.1: Workflow Cleanup & Extensionless File Purge (2 SP)] --> S12[Sprint 1.2: Standardized Environment Templates & Visual Calibration (3 SP)]
    S12 --> S13[Sprint 1.3: Monorepo Workspaces & Utility Unification (5 SP)]
```

### Sprint Breakdown

1. **[Sprint 1.1: Workflow Cleanup & Extensionless File Purge](../Sprints/sprint_1_1_workflow_cleanup_and_extensionless_file_purge.md)**
   - *Estimated Effort*: 2 Story Points
   - *Target Pillars*: Pillar 5 (CI/CD Workflow Modernization)
   - *Key Deliverables*:
     - Deletion of 4 dead extensionless files in `.github/workflows/`:
       - `Playwright Automation CI (Sharded)`
       - `Playwright Automation CI - Docker (Sharded Optimized)`
       - `Playwright Automation CI - Docker (Sharded)`
       - `Playwright Automation CI - Kubernetes (Sharded Optimized)`
     - Removal of legacy `performance-crud.yaml` (fully superseded by `jmeter-performance.yaml`).
     - Validation that all remaining workflows have valid YAML syntax and include mandatory Render pre-flight warm-up probes.
   - *Verification*: GitHub Actions workflow linter passes with zero errors; no dead files detected.

2. **[Sprint 1.2: Standardized Environment Templates & Visual Baseline Calibration](../Sprints/sprint_1_2_standardized_env_templates_and_visual_baseline_calibration.md)**
   - *Estimated Effort*: 3 Story Points
   - *Target Pillars*: Pillar 6 (Environment Templates) & Pillar 7 (Visual Snapshot Calibration)
   - *Key Deliverables*:
     - Comprehensive root `.env.example` defining global parameters (`STAGING_FRONTEND_URL`, `STAGING_BACKEND_URL`, `DEFAULT_BROWSER`).
     - Project-level `.env.example` templates in `playwright-e2e/`, `selenium-e2e/`, and `wdio-e2e/`.
     - Calibration and generation of golden snapshots for `Test_010_VisualRegressionChaos.spec.ts` under the single Google Chrome project.
     - Execution of visual regression tests locally to ensure zero pixel-diff discrepancies.
   - *Verification*: `npm run test:ui -- Test_010_VisualRegressionChaos.spec.ts` passes 100% green without snapshot mismatch errors.

3. **[Sprint 1.3: Monorepo Workspaces & Utility Package Unification](../Sprints/sprint_1_3_monorepo_workspaces_and_utility_unification.md)**
   - *Estimated Effort*: 5 Story Points
   - *Target Pillars*: Pillar 2 (Monorepo Workspaces & `playwright-utils` Package Unification)
   - *Key Deliverables*:
     - Creation of monorepo root `package.json` declaring `workspaces: ["packages/playwright-utils", "playwright-e2e", "selenium-e2e", "wdio-e2e"]`.
     - Relocation and packaging of `playwright-utils/` to `packages/playwright-utils/` as `@automationframeworks/playwright-utils`.
     - Linking of `@automationframeworks/playwright-utils` in `playwright-e2e/package.json`.
     - Deprecation and refactoring of duplicate `base.page.ts`, `logger.ts`, and `common.util.ts` from `playwright-e2e/src/core/base/`.
     - Implementation of root orchestration commands (`npm run lint:all`, `npm run typecheck:all`, `npm run test:smoke:all`).
   - *Verification*: Single root `npm install` symlinks workspace packages cleanly; `npm run typecheck:all` exits 0.

---

## 4. Definition of Done & Quality Acceptance Gates

- [ ] All 4 extensionless files and legacy CRUD workflows are permanently purged from `.github/workflows/`.
- [ ] Root and sub-project `.env.example` templates are committed with clear documentation and safe default values.
- [ ] Visual regression tests pass deterministically on Google Chrome without manual snapshot overrides.
- [ ] Monorepo root `package.json` coordinates all frameworks via npm workspaces.
- [ ] Code duplication between `playwright-utils` and `playwright-e2e` is eliminated; shared utilities reside strictly in `packages/playwright-utils/`.
- [ ] `npm run lint:all` and `npm run typecheck:all` exit with code `0`.
- [ ] Playwright test suite maintains exact ~110 test count (55 API + 54 Chrome UI + 1 auth setup).

---

## 5. Risks, Gotchas & Mitigation Strategies

| Threat / Gotcha | Impact | Mitigation Strategy |
| :--- | :--- | :--- |
| **Workspace Hoisting Conflicts** | TypeScript or ESLint version discrepancies between root and subpackages cause resolution failures. | Pin exact peer and dev dependencies across workspaces; utilize npm workspace protocol (`*`) for internal packages. |
| **Cross-Platform Visual Diffs** | Windows vs Linux font rendering creates pixel mismatches in visual regression tests. | Calibrate snapshots with Playwright `maxDiffPixelRatio: 0.05` and maintain OS-specific snapshot baselines in git. |
| **Accidental Multi-Browser Leak** | Editing `playwright.config.ts` during refactoring inadvertently restores Firefox/WebKit. | Strict linting rule and CI check asserting project count strictly equals 3 (`setup`, `api`, `chrome`). |
