# Sprint 4.2: Appium Android/iOS Smoke & Chaos E2E Verification

**Navigation**: [⬅️ Previous: Sprint 4.1](sprint_4_1_mobile_automation_monorepo_import_and_scaffolding.md) | [🗺️ Planning Hub](../README.md) | **Sprint 4.2** | [➡️ Next: Sprint 4.3](sprint_4_3_mobile_ci_pipeline_and_emulator_execution_workflows.md)

**Sprint Identifier**: `SPRINT-4.2-APPIUM-SMOKE-AND-CHAOS-VERIFICATION`  
**Phase Mapping**: [Phase 4: Mobile Automation (Appium + WebdriverIO)](../Phases/phase_4_mobile_automation_appium_and_webdriverio.md)  
**Estimated Velocity**: 5 Story Points  
**Sprint Status**: Done  
**Sprint Goal**: Port mobile test specifications to `mobile-automation/src/specs/`, validate authentication, catalog touch interactions, orientation toggling, and payment chaos handling, and synchronize the dual Test Cases Catalog with `TC-MOB-001` through `TC-MOB-006`.

---

## 1. Persona Roles & Ownership Matrix

| Persona | Assigned Member | Responsibilities for this Sprint |
| :--- | :--- | :--- |
| **Mobile QA Specialist** | AI Agent / Mobile | Porting mobile specs, handling mobile gesture assertions, and verifying chaos test resilience. |
| **SDET Architect** | AI Agent / SDET | Mapping mobile test cases in dual catalogs (`docs/` and `playwright-e2e/`) and maintaining skill definitions. |
| **DevOps Engineer** | AI Agent / DevOps | Assisting in local Appium server orchestration and emulator test execution validation. |

---

## 2. Sprint Backlog & Granular User Stories

### User Story US-AF-421: Mobile E2E Smoke & Chaos Spec Porting
- **Story Statement**:  
  *As an* SDET,  
  *I want* comprehensive mobile E2E specs validating touch gestures, catalog browsing, orientation switching, and network chaos,  
  *So that* the mobile application's UX and fault tolerance are thoroughly automated.
- **Story Points**: 3 SP (Medium-Large)
- **Technical Subtasks**:
  - [x] Port specs from `buggy-books/mobile-automation/src/specs/`:
    - `auth.e2e.spec.ts` (`TC-MOB-001` & `TC-MOB-006`): Valid/invalid login, session persistence across backgrounding.
    - `catalog.e2e.spec.ts` (`TC-MOB-002` & `TC-MOB-005`): Touch scroll, book selection, bottom-sheet modal interaction, cart mutation, and offline sync.
    - `checkout_chaos.e2e.spec.ts` (`TC-MOB-003`): Payment gateway chaos handling, keyboard occlusion dismissal, and retry button validation with teardown state reset.
    - `orientation_chaos.e2e.spec.ts` (`TC-MOB-004`): Portrait to Landscape rotation state preservation and restoration.
  - [x] Implement mobile gesture assertions using WebdriverIO mobile commands (`driver.action('pointer')`, `driver.setOrientation()`, `driver.background()`).
  - [x] Verify test specs execute in headless mode using simulated Appium mocks or connected emulators.
- **Acceptance Criteria**:
  - All 4 mobile specs compile cleanly with zero TypeScript errors.
  - Orientation toggle and chaos retry logic pass verification.

### User Story US-AF-422: Dual Catalog Synchronization & Mobile Agent Skill
- **Story Statement**:  
  *As a* QA Lead,  
  *I want* mobile test cases documented in both catalogs and a specialized mobile agent skill created in `.agents/skills/`,  
  *So that* team members and AI assistants have full visibility and automated guidance for mobile testing.
- **Story Points**: 2 SP (Medium)
- **Technical Subtasks**:
  - [x] Update `docs/test_cases_catalog.md` and `playwright-e2e/test_cases_catalog.md` with:
    - `TC-MOB-001`: Mobile User Authentication & Session Persistence
    - `TC-MOB-002`: Mobile Catalog Gestures & Bottom-Sheet Modal
    - `TC-MOB-003`: Mobile Payment Gateway Chaos & Toast Verification
    - `TC-MOB-004`: Mobile Orientation Toggle & State Preservation
    - `TC-MOB-005`: Mobile Cart Mutation & Offline Sync
    - `TC-MOB-006`: Mobile Backgrounding & App Resume Lifecycle
  - [x] Create and enrich `.agents/skills/role-mobile-appium-specialist/SKILL.md` detailing:
    - Appium 2.x server launch commands.
    - Android/iOS emulator configuration and capability options.
    - Screen Object design guidelines and mobile gesture recipes.
- **Acceptance Criteria**:
  - Both catalog files maintain 100% parity across mobile entries.
  - Mobile specialist agent skill is registered and documented.

---

## 3. Definition of Done & Quality Gates

- [x] All 4 mobile specs ported and compile with zero errors.
- [x] Both catalog files updated with `TC-MOB-001..006`.
- [x] `.agents/skills/role-mobile-appium-specialist/SKILL.md` authored.
- [x] Gesture helpers in `BaseMobileScreen.ts` verified.


---

## 4. Sprint Velocity & Deliverables Summary

| Artifact / File | Type | Target State / Description |
| :--- | :--- | :--- |
| `mobile-automation/src/specs/` | Test Specs | 4 mobile E2E and chaos test specifications. |
| `docs/test_cases_catalog.md` | Catalog | Master catalog updated with mobile suite. |
| `playwright-e2e/test_cases_catalog.md` | Catalog | Duplicate catalog updated in exact lockstep. |
| `.agents/skills/role-mobile-appium-specialist/` | Skill | Dedicated agent persona for Appium mobile automation. |

---

**Next Steps**: Proceed to [Sprint 4.3: Mobile CI Pipeline & Emulator Execution Workflows](sprint_4_3_mobile_ci_pipeline_and_emulator_execution_workflows.md).
