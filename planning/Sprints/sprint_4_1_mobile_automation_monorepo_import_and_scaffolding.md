# Sprint 4.1: Mobile Automation Monorepo Import & Scaffolding

**Sprint Identifier**: `SPRINT-4.1-MOBILE-IMPORT-AND-SCAFFOLDING`  
**Phase Mapping**: [Phase 4: Mobile Automation (Appium + WebdriverIO)](file:///c:/Workspace/AutomationFrameworks/planning/Phases/phase_4_mobile_automation_appium_and_webdriverio.md)  
**Estimated Velocity**: 4 Story Points  
**Sprint Goal**: Import the Appium 2.x and WebdriverIO mobile automation framework from `buggy-books` into `AutomationFrameworks/mobile-automation`, register it in monorepo workspaces, configure device capabilities, and verify Screen Object compilation.

---

## 1. Persona Roles & Ownership Matrix

| Persona | Assigned Member | Responsibilities for this Sprint |
| :--- | :--- | :--- |
| **Mobile QA Specialist** | AI Agent / Mobile | Scaffolding the `mobile-automation` package, configuring Appium 2.x drivers, and verifying Screen Objects. |
| **SDET Architect** | AI Agent / SDET | Integrating mobile dependencies into root `package.json` workspaces and enforcing TypeScript standards. |
| **DevOps Engineer** | AI Agent / DevOps | Creating environment variable templates and auditing mobile driver dependencies. |

---

## 2. Sprint Backlog & Granular User Stories

### User Story US-AF-411: Mobile Framework Monorepo Integration
- **Story Statement**:  
  *As an* SDET Architect,  
  *I want* the `mobile-automation/` suite imported into the monorepo and registered in root `workspaces`,  
  *So that* mobile testing can be built, typechecked, and executed alongside web and performance frameworks.
- **Story Points**: 2 SP (Medium)
- **Technical Subtasks**:
  - [ ] Port `c:\Workspace\buggy-books\mobile-automation\` into `AutomationFrameworks/mobile-automation/`:
    - `package.json`: WebdriverIO 8+, `@wdio/appium-service`, `appium-uiautomator2-driver`, `appium-xcuitest-driver`.
    - `tsconfig.json`: TypeScript configuration with `target: ES2022` and strict module resolution.
    - `src/config/`: `wdio.shared.conf.ts`, `wdio.android.conf.ts`, `wdio.ios.conf.ts`.
    - `src/core/`: `BaseMobileScreen.ts` and `Logger.ts`.
    - `src/screens/`: `LoginScreen.ts`, `CatalogScreen.ts`, `CartScreen.ts`, `CheckoutScreen.ts`, `ChaosScreen.ts`, `NavigationTab.ts`.
  - [ ] Register `"mobile-automation"` in root `package.json` `workspaces` array.
  - [ ] Run `npm install` at root to link dependencies.
- **Acceptance Criteria**:
  - `npm install` completes cleanly with `mobile-automation` symlinked.
  - `npm run typecheck --workspace=mobile-automation` passes with 0 errors.

### User Story US-AF-412: Appium 2.x Configuration & Device Profiles
- **Story Statement**:  
  *As a* Mobile Test Engineer,  
  *I want* calibrated Appium 2.x device capability profiles for Android and iOS emulators,  
  *So that* tests execute deterministically in both local development and headless CI pipelines.
- **Story Points**: 2 SP (Medium)
- **Technical Subtasks**:
  - [ ] Author `mobile-automation/.env.example`:
    ```dotenv
    APPIUM_HOST=127.0.0.1
    APPIUM_PORT=4723
    ANDROID_DEVICE_NAME=Pixel_6_API_33
    ANDROID_PLATFORM_VERSION=13.0
    IOS_DEVICE_NAME=iPhone 14
    IOS_PLATFORM_VERSION=16.4
    ```
  - [ ] Ensure `wdio.android.conf.ts` specifies `appium:automationName: 'UiAutomator2'`.
  - [ ] Ensure `wdio.ios.conf.ts` specifies `appium:automationName: 'XCUITest'`.
  - [ ] Add gesture helpers to `BaseMobileScreen.ts` (swipe, scroll to text, pinch, orientation toggle).
- **Acceptance Criteria**:
  - Appium 2.x config files are complete and type-safe.
  - Base Screen Object includes touch and gesture primitives.

---

## 3. Definition of Done & Quality Gates

- [ ] `mobile-automation/` is tracked under monorepo `workspaces`.
- [ ] TypeScript compilation exits `0` across all Screen Objects.
- [ ] `.env.example` created in `mobile-automation/`.
- [ ] Appium 2.x configs for Android and iOS validate without syntax errors.

---

## 4. Sprint Velocity & Deliverables Summary

| Artifact / File | Type | Target State / Description |
| :--- | :--- | :--- |
| `mobile-automation/` | Package | Standalone Appium 2.x + WebdriverIO mobile automation framework. |
| `mobile-automation/src/screens/` | Screen Objects | 6 BuggyBooks mobile screen objects. |
| `mobile-automation/src/config/` | Config | Shared, Android, and iOS WebdriverIO configurations. |
| `package.json` | Root Config | Updated workspaces array including `mobile-automation`. |
