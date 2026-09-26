# Phase 4: Mobile Automation (Appium + WebdriverIO)

**Navigation**: [🗺️ Planning Hub](../README.md) | [📖 Master Plan](../Master/master_plan.md) | [Phase 1](phase_1_monorepo_foundations_pipeline_hygiene_and_utility_unification.md) | [Phase 2](phase_2_documentation_integrity_anti_pattern_manual_and_quality_gates.md) | [Phase 3](phase_3_webdriverio_and_selenium_alignment_to_buggybooks.md) | **[Phase 4]** | [Phase 5](phase_5_executive_observability_and_unified_allure_dashboard.md)

**Phase Identifier**: `PHASE-4-MOBILE-APPIUM-AUTOMATION`  
**Phase Status**: Planned  
**Total Phase Velocity**: **14 Story Points** (Sprint 4.1: 4 SP, Sprint 4.2: 5 SP, Sprint 4.3: 5 SP)  
**Phase Leads**: SDET Architect & Mobile QA Specialist  
**Primary Personas**: SDET Architect, Mobile QA Specialist, DevOps Engineer  

---

## 1. Executive Summary & Phase Theme

Modern e-commerce platforms like BuggyBooks must deliver seamless user experiences across mobile applications just as reliably as on desktop web browsers. However, the `AutomationFrameworks` monorepo currently contains **zero mobile test automation capabilities**.

In `buggy-books`, a high-caliber mobile automation framework was engineered using **Appium 2.x** and **WebdriverIO**, featuring:
- Reusable Appium 2.x configurations for both Android (`UiAutomator2`) and iOS (`XCUITest`).
- Screen Object Model architecture with `BaseMobileScreen.ts` providing robust mobile gestures, touch actions, and auto-waiting.
- Typed Screen Objects (`LoginScreen`, `CatalogScreen`, `CartScreen`, `CheckoutScreen`, `ChaosScreen`, `NavigationTab`).
- Specialized mobile chaos and resilience test specifications:
  - `auth.e2e.spec.ts`: Mobile session authentication and biometric/credential handling.
  - `catalog.e2e.spec.ts`: Mobile gesture scrolling, catalog browsing, and detail bottom-sheet modal.
  - `checkout_chaos.e2e.spec.ts`: Simulating mobile network drops and payment failures.
  - `orientation_chaos.e2e.spec.ts`: Screen rotation (portrait $\leftrightarrow$ landscape) resilience without state loss.

**Phase 4** imports this mobile automation capability into `AutomationFrameworks/mobile-automation`, integrates it into `npm workspaces`, connects it to the dual Test Cases Catalog, and establishes a GitHub Actions workflow (`mobile-ci.yml`) for automated emulator testing.

---

## 2. Architectural Scope & Target Outcomes

| Subsystem / Workstream | Current State / Defect | Phase Target Outcome |
| :--- | :--- | :--- |
| **Mobile Automation Capability** | No mobile testing directory exists in `AutomationFrameworks`. | Fully integrated `mobile-automation/` package containing Appium 2.x + WebdriverIO configurations and test suites. |
| **Screen Object Models** | No mobile page/screen objects exist. | Complete Screen Object hierarchy: `BaseMobileScreen`, `LoginScreen`, `CatalogScreen`, `CartScreen`, `CheckoutScreen`, `ChaosScreen`, `NavigationTab`. |
| **Mobile Chaos & Resilience** | Mobile-specific edge cases (orientation switch, app backgrounding) are unautomated. | Automated specs for orientation chaos (`orientation_chaos.e2e.spec.ts`) and payment retry chaos (`checkout_chaos.e2e.spec.ts`). |
| **Monorepo Workspace Integration** | `package.json` at root does not track mobile dependencies. | `mobile-automation` declared in root `workspaces`; runnable via `npm run test:mobile:smoke`. |
| **Mobile CI/CD Pipeline** | No mobile execution workflow in `.github/workflows/`. | Dedicated `.github/workflows/mobile-ci.yml` running headless Android emulator tests with reactive artifact upload. |
| **Dual Catalog Traceability** | Neither catalog file documents mobile test case IDs. | Both `docs/test_cases_catalog.md` and `playwright-e2e/test_cases_catalog.md` updated with `TC-MOB-001` through `TC-MOB-006`. |

---

## 3. Sprints in this Phase

```mermaid
graph LR
    S41[Sprint 4.1: Mobile Import & Scaffolding (4 SP)] --> S42[Sprint 4.2: Appium Smoke & Chaos Verification (5 SP)]
    S42 --> S43[Sprint 4.3: Mobile CI Pipeline & Emulators (5 SP)]
```

### Sprint Breakdown

1. **[Sprint 4.1: Mobile Automation Monorepo Import & Scaffolding](../Sprints/sprint_4_1_mobile_automation_monorepo_import_and_scaffolding.md)**
   - *Estimated Effort*: 4 Story Points
   - *Target Pillars*: Pillar 3 (Mobile Test Automation Suite)
   - *Key Deliverables*:
     - Porting `mobile-automation/` from `buggy-books` into `AutomationFrameworks/mobile-automation/`:
       - `package.json`: WebdriverIO 8+, `@wdio/appium-service`, `appium-uiautomator2-driver`, `appium-xcuitest-driver`.
       - `tsconfig.json`: TypeScript configuration aligned with root conventions.
       - `src/config/`: `wdio.shared.conf.ts`, `wdio.android.conf.ts`, `wdio.ios.conf.ts`.
       - `src/core/`: `BaseMobileScreen.ts` and `Logger.ts`.
       - `src/screens/`: `LoginScreen.ts`, `CatalogScreen.ts`, `CartScreen.ts`, `CheckoutScreen.ts`, `ChaosScreen.ts`, `NavigationTab.ts`.
     - Registering `mobile-automation` in monorepo root `workspaces`.
     - Authoring `mobile-automation/.env.example` with documented device caps (`APPIUM_HOST`, `APPIUM_PORT`, `ANDROID_DEVICE_NAME`, `IOS_DEVICE_NAME`).
   - *Verification*: `npm install` at root links `mobile-automation` cleanly; `npm run typecheck --workspace=mobile-automation` passes with 0 errors.

2. **[Sprint 4.2: Appium Android/iOS Smoke & Chaos E2E Verification](../Sprints/sprint_4_2_appium_android_ios_smoke_and_chaos_e2e_verification.md)**
   - *Estimated Effort*: 5 Story Points
   - *Target Pillars*: Pillar 3 (Mobile Test Automation Suite) & Pillar 5 (Catalog Parity)
   - *Key Deliverables*:
     - Porting and validating mobile test specifications in `mobile-automation/src/specs/`:
       - `auth.e2e.spec.ts` (`TC-MOB-001`): Mobile login with valid/invalid credentials, session persistence across app backgrounding.
       - `catalog.e2e.spec.ts` (`TC-MOB-002`): Touch scrolling, book item tap, bottom-sheet detail view.
       - `checkout_chaos.e2e.spec.ts` (`TC-MOB-003`): Payment gateway chaos handling with mobile error toast validation.
       - `orientation_chaos.e2e.spec.ts` (`TC-MOB-004`): Dynamic orientation toggle (`driver.setOrientation('LANDSCAPE')`) verifying cart state preservation.
     - Adding test cases `TC-MOB-001` through `TC-MOB-006` to both `docs/test_cases_catalog.md` and `playwright-e2e/test_cases_catalog.md`.
     - Updating `AGENTS.md` and `.agents/skills/role-mobile-appium-specialist` with mobile testing rules and recipes.
   - *Verification*: Appium specs compile with full TypeScript typing; dual catalog validation confirms 100% parity.

3. **[Sprint 4.3: Mobile CI Pipeline & Emulator Execution Workflows](../Sprints/sprint_4_3_mobile_ci_pipeline_and_emulator_execution_workflows.md)**
   - *Estimated Effort*: 5 Story Points
   - *Target Pillars*: Pillar 3 (Mobile Test Automation Suite) & Pillar 5 (CI/CD Modernization)
   - *Key Deliverables*:
     - Authoring `.github/workflows/mobile-ci.yml` supporting:
       - GitHub Actions hardware acceleration (`macos-latest` or `ubuntu-latest` with KVM).
       - Android Emulator Runner caching system images (`reactivecircus/android-emulator-runner@v2`).
       - Appium server background boot and headless execution.
       - Mobile Allure results capture and artifact archival.
     - Providing local execution helper scripts (`scripts/run-android-local.sh`, `scripts/run-android-local.ps1`).
     - Adding root command `npm run test:mobile:smoke`.
   - *Verification*: `.github/workflows/mobile-ci.yml` syntax validated via actionlint; local script boots Appium test runner successfully.

---

## 4. Definition of Done & Quality Acceptance Gates

- [ ] `mobile-automation/` is completely scaffolded and tracked under monorepo `workspaces`.
- [ ] All 6 Screen Objects and 4 E2E specs pass TypeScript compilation with zero `any` types.
- [ ] Both test case catalog files (`docs/test_cases_catalog.md` and `playwright-e2e/test_cases_catalog.md`) index mobile test cases `TC-MOB-001..006`.
- [ ] Dedicated skill file `.agents/skills/role-mobile-appium-specialist/SKILL.md` is active.
- [ ] `.github/workflows/mobile-ci.yml` is committed and validated with proper emulator caching.
- [ ] Root scripts `npm run typecheck:all` and `npm run lint:all` include `mobile-automation`.

---

## 5. Risks, Gotchas & Mitigation Strategies

| Threat / Gotcha | Impact | Mitigation Strategy |
| :--- | :--- | :--- |
| **CI Emulator Boot Latency** | Android emulator startup takes 5–8 minutes in CI, risking job timeout. | Use `reactivecircus/android-emulator-runner` with `api-level: 30`, `target: google_apis`, and snapshot caching. |
| **Appium 2.x Driver Missing** | Appium server fails to start because `uiautomator2` driver is not installed. | Add pre-test step in package.json/CI: `npx appium driver install uiautomator2`. |
| **Orientation Switch Flakiness** | Device rotation triggers layout redraw while element action is attempted. | Implement explicit settling delay and re-check element visibility in `BaseMobileScreen.ts` after rotation. |
