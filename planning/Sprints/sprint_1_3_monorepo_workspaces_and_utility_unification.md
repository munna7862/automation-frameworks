# Sprint 1.3: Monorepo Workspaces & Utility Package Unification

**Navigation**: [⬅️ Previous: Sprint 1.2](sprint_1_2_standardized_env_templates_and_visual_baseline_calibration.md) | [🗺️ Planning Hub](../README.md) | **Sprint 1.3** | [➡️ Next: Sprint 2.1](sprint_2_1_intentional_bugs_and_chaos_testing_guide.md)

**Sprint Identifier**: `SPRINT-1.3-MONOREPO-WORKSPACES-AND-UTILITY-UNIFICATION`  
**Phase Mapping**: [Phase 1: Monorepo Foundations, Pipeline Hygiene & Utility Unification](../Phases/phase_1_monorepo_foundations_pipeline_hygiene_and_utility_unification.md)  
**Estimated Velocity**: 5 Story Points  
**Sprint Status**: Completed  
**Sprint Goal**: Implement an `npm workspaces` root monorepo architecture, convert `playwright-utils/` into `@automationframeworks/playwright-utils` under `packages/`, link it to `playwright-e2e`, eliminate duplicated core utilities, and establish root orchestration scripts.

---

## 1. Persona Roles & Ownership Matrix

| Persona | Assigned Member | Responsibilities for this Sprint |
| :--- | :--- | :--- |
| **SDET Architect** | AI Agent / SDET | Architecting the npm workspaces schema, defining package boundary rules, and authoring root orchestration commands. |
| **Playwright QA Lead** | AI Agent / QA | Refactoring `playwright-e2e` imports to consume `@automationframeworks/playwright-utils` and verifying zero regressions. |
| **DevOps Engineer** | AI Agent / DevOps | Updating CI workflows to leverage npm workspace commands (`npm run lint:all`, `npm run typecheck:all`). |

---

## 2. Sprint Backlog & Granular User Stories

### User Story US-AF-131: Root Monorepo Package & Workspace Setup
- **Story Statement**:  
  *As a* Full-Stack Test Engineer working across multiple frameworks,  
  *I want* a root `package.json` that coordinates all projects via npm workspaces,  
  *So that* a single `npm install` bootstraps dependencies across all frameworks with unified linting and typechecking scripts.
- **Story Points**: 2 SP (Medium)
- **Technical Subtasks**:
  - [x] Create root `package.json` declaring workspaces:
    ```json
    {
      "name": "automation-frameworks-monorepo",
      "version": "1.0.0",
      "private": true,
      "workspaces": [
        "packages/*",
        "playwright-e2e",
        "selenium-e2e",
        "wdio-e2e"
      ],
      "scripts": {
        "lint:all": "npm run lint --workspaces --if-present",
        "typecheck:all": "npm run typecheck --workspaces --if-present",
        "test:smoke:all": "npm run test:smoke --workspace=playwright-e2e",
        "clean": "npm run clean --workspaces --if-present"
      },
      "devDependencies": {
        "typescript": "^5.4.0"
      }
    }
    ```
  - [x] Move `playwright-utils/` into `packages/playwright-utils/`.
  - [x] Update `packages/playwright-utils/package.json` to name: `@automationframeworks/playwright-utils`.
- **Acceptance Criteria**:
  - `npm install` at root links internal packages without npm registry errors.
  - `npm run typecheck:all` runs TypeScript verification across all workspaces.

### User Story US-AF-132: Elimination of Duplicated Base Utilities
- **Story Statement**:  
  *As an* Automation Engineer,  
  *I want* shared Page Objects, Winston loggers, and common assertion utilities consolidated in `@automationframeworks/playwright-utils`,  
  *So that* bug fixes in base utilities automatically benefit all consuming test specs without code divergence.
- **Story Points**: 3 SP (Medium-Large)
- **Technical Subtasks**:
  - [x] Add `"@automationframeworks/playwright-utils": "*"` to `playwright-e2e/package.json` dependencies.
  - [x] Audit duplicated files between `packages/playwright-utils/src/` and `playwright-e2e/src/core/base/`:
    - `base.page.ts`
    - `logger.ts`
    - `common.util.ts`
  - [x] Refactor imports across `playwright-e2e` Page Objects to import from `@automationframeworks/playwright-utils`.
  - [x] Remove redundant duplicate files from `playwright-e2e/src/core/base/`.
  - [x] Run full Playwright test suite to verify 100% functionality:
    ```bash
    npm run test:api --workspace=playwright-e2e
    npm run test:ui --workspace=playwright-e2e
    ```
- **Acceptance Criteria**:
  - Zero duplicated `base.page.ts` or `logger.ts` files exist.
  - All 110 Playwright tests compile and run with 0 import errors.

---

## 3. Definition of Done & Quality Gates

- [x] Root `package.json` with npm workspaces configured and operational.
- [x] `packages/playwright-utils` successfully builds and exports shared utilities.
- [x] `playwright-e2e` consumes `@automationframeworks/playwright-utils` cleanly.
- [x] `npm run lint:all` and `npm run typecheck:all` exit 0.
- [x] Exactly 110 Playwright tests remain active (55 API + 54 Chrome UI + 1 auth setup).

---

## 4. Sprint Velocity & Deliverables Summary

| Artifact / File | Type | Target State / Description |
| :--- | :--- | :--- |
| `package.json` | Root Config | Monorepo root workspace orchestration file. |
| `packages/playwright-utils/` | Package | Standalone shared utilities library (`@automationframeworks/playwright-utils`). |
| `playwright-e2e/package.json` | Config | Updated with internal workspace dependency. |
| `playwright-e2e/src/` | Codebase | Refactored to import from `@automationframeworks/playwright-utils`. |

---

**Next Steps**: Proceed to [Sprint 2.1: Intentional Bugs & Chaos Testing Guide](sprint_2_1_intentional_bugs_and_chaos_testing_guide.md).
