# Sprint 1.2: Standardized Environment Templates & Visual Baseline Calibration

**Navigation**: [⬅️ Previous: Sprint 1.1](sprint_1_1_workflow_cleanup_and_extensionless_file_purge.md) | [🗺️ Planning Hub](../README.md) | **Sprint 1.2** | [➡️ Next: Sprint 1.3](sprint_1_3_monorepo_workspaces_and_utility_unification.md)

**Sprint Identifier**: `SPRINT-1.2-ENV-TEMPLATES-AND-VISUAL-CALIBRATION`  
**Phase Mapping**: [Phase 1: Monorepo Foundations, Pipeline Hygiene & Utility Unification](../Phases/phase_1_monorepo_foundations_pipeline_hygiene_and_utility_unification.md)  
**Estimated Velocity**: 3 Story Points  
**Sprint Status**: Done  
**Sprint Goal**: Create documented, secure `.env.example` templates for all monorepo test frameworks, and calibrate golden visual regression baselines for `Test_010_VisualRegressionChaos.spec.ts` strictly under Google Chrome (`channel: 'chrome'`).

---

## 1. Persona Roles & Ownership Matrix

| Persona | Assigned Member | Responsibilities for this Sprint |
| :--- | :--- | :--- |
| **Playwright QA Lead** | AI Agent / QA | Calibrating visual regression snapshots for `Test_010_VisualRegressionChaos.spec.ts` under Chrome and updating snapshot configs. |
| **SDET Architect** | AI Agent / SDET | Designing standardized environment configuration schemas and documenting default variables. |
| **DevOps Engineer** | AI Agent / DevOps | Ensuring CI environment variables map correctly to `.env.example` definitions across GitHub runners. |

---

## 2. Sprint Backlog & Granular User Stories

### User Story US-AF-121: Standardized Environment Configuration Templates
- **Story Statement**:  
  *As an* Automation Engineer configuring a new development or CI environment,  
  *I want* self-documenting `.env.example` files in the monorepo root and each sub-project,  
  *So that* all required keys, URLs, credentials, and timeouts are clear without guessing or committing real secrets.
- **Story Points**: 1.5 SP (Medium)
- **Technical Subtasks**:
  - [x] Create root `.env.example`:
    ```dotenv
    # BuggyBooks Staging URLs
    BASE_URL=https://buggy-books-fe.onrender.com
    API_BASE_URL=https://buggy-books.onrender.com/api
    
    # Test Execution Defaults
    DEFAULT_BROWSER=chrome
    HEADLESS=true
    ELEMENT_TIMEOUT=15000
    
    # Authentication
    TEST_USER=testuser@example.com
    TEST_PASSWORD=Password123!
    ```
  - [x] Create `playwright-e2e/.env.example` with Playwright-specific variables (`CHANNEL=chrome`, `WORKERS=2`, `RETRIES=1`, `CI=false`).
  - [x] Create `selenium-e2e/.env.example` and `wdio-e2e/.env.example`.
  - [x] Verify `.gitignore` strictly ignores `.env` files while allowing `.env.example`.
- **Acceptance Criteria**:
  - Every project directory has a documented `.env.example`.
  - No secret credentials or sensitive tokens are committed to source control.

### User Story US-AF-122: Visual Baseline Calibration for Google Chrome
- **Story Statement**:  
  *As a* QA Specialist maintaining visual regression tests,  
  *I want* golden snapshot images calibrated specifically for Google Chrome on Linux and Windows runners,  
  *So that* visual regression tests validate UI layout stability without generating false-positive pixel diffs in CI.
- **Story Points**: 1.5 SP (Medium)
- **Technical Subtasks**:
  - [x] Inspect `playwright-e2e/src/tests/ui/VisualRegression/Test_010_VisualRegressionChaos.spec.ts`.
  - [x] Calibrate snapshot expectations in `Test_010_VisualRegressionChaos.spec.ts-snapshots/`:
    - `catalog-baseline-chrome-linux.png`
    - `catalog-baseline-chrome-win32.png`
  - [x] Configure Playwright visual comparison options:
    ```typescript
    await expect(page).toHaveScreenshot('catalog-baseline.png', {
      maxDiffPixelRatio: 0.05,
      threshold: 0.2,
      animations: 'disabled',
    });
    ```
  - [x] Execute visual regression test locally on Chrome:
    ```bash
    npx playwright test src/tests/ui/VisualRegression/Test_010_VisualRegressionChaos.spec.ts --project=chrome
    ```
- **Acceptance Criteria**:
  - `VIS_REG_01` (Baseline Catalog Screenshot) passes 100% green on Chrome.
  - `VIS_REG_02` (Chaos Visual Diff) correctly catches injected visual layout mutations.

---

## 3. Definition of Done & Quality Gates

- [x] `.env.example` files created in root, `playwright-e2e/`, `selenium-e2e/`, and `wdio-e2e/`.
- [x] Visual regression test passes locally and in CI on project `chrome`.
- [x] No multiple browser snapshots (no Firefox or WebKit) exist in snapshot directories.
- [x] `.gitignore` prevents `.env` or temporary screenshot diffs from being committed.

---

## 4. Sprint Velocity & Deliverables Summary

| Artifact / File | Type | Target State / Description |
| :--- | :--- | :--- |
| `.env.example` | Root Config | Monorepo global environment variable template. |
| `playwright-e2e/.env.example` | Config | Playwright project environment variable template. |
| `selenium-e2e/.env.example` | Config | Selenium project environment variable template. |
| `wdio-e2e/.env.example` | Config | WebdriverIO project environment variable template. |
| `Test_010_VisualRegressionChaos.spec.ts` | Test Spec | Calibrated Chrome visual regression test. |

---

**Next Steps**: Proceed to [Sprint 1.3: Monorepo Workspaces & Utility Package Unification](sprint_1_3_monorepo_workspaces_and_utility_unification.md).
