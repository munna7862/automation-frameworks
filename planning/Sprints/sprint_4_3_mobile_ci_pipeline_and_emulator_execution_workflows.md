# Sprint 4.3: Mobile CI Pipeline & Emulator Execution Workflows

**Sprint Identifier**: `SPRINT-4.3-MOBILE-CI-AND-EMULATOR-PIPELINE`  
**Phase Mapping**: [Phase 4: Mobile Automation (Appium + WebdriverIO)](file:///c:/Workspace/AutomationFrameworks/planning/Phases/phase_4_mobile_automation_appium_and_webdriverio.md)  
**Estimated Velocity**: 5 Story Points  
**Sprint Goal**: Implement an automated GitHub Actions mobile execution pipeline (`.github/workflows/mobile-ci.yml`) leveraging Android Emulator Runner, manage the Appium server lifecycle headlessly, and provide cross-platform local run scripts.

---

## 1. Persona Roles & Ownership Matrix

| Persona | Assigned Member | Responsibilities for this Sprint |
| :--- | :--- | :--- |
| **DevOps Engineer** | AI Agent / DevOps | Authoring `.github/workflows/mobile-ci.yml`, managing emulator hardware acceleration, and caching system images. |
| **Mobile QA Specialist** | AI Agent / Mobile | Developing local helper scripts (`run-android-local.sh`, `run-android-local.ps1`) and verifying CI test runner commands. |
| **SDET Architect** | AI Agent / SDET | Setting mobile CI execution SLAs and integrating mobile commands into root monorepo scripts. |

---

## 2. Sprint Backlog & Granular User Stories

### User Story US-AF-431: Mobile CI Pipeline with Android Emulator Runner
- **Story Statement**:  
  *As a* DevOps Engineer,  
  *I want* a dedicated GitHub Actions workflow running mobile tests on an automated Android emulator,  
  *So that* mobile regressions are caught on scheduled nightlies or manual workflow dispatches.
- **Story Points**: 3 SP (Medium-Large)
- **Technical Subtasks**:
  - [ ] Author `.github/workflows/mobile-ci.yml`:
    ```yaml
    name: Mobile Appium Automation CI
    on:
      workflow_dispatch:
      schedule:
        - cron: '0 3 * * *'

    jobs:
      android-test:
        name: Android Appium E2E Specs
        runs-on: macos-13
        steps:
          - uses: actions/checkout@v4
          - uses: actions/setup-node@v4
            with:
              node-version: 20
              cache: 'npm'
          - run: npm ci
          - name: Setup Java JDK
            uses: actions/setup-java@v4
            with:
              distribution: 'temurin'
              java-version: '17'
          - name: Install Appium & UiAutomator2 Driver
            run: |
              npm install -g appium
              appium driver install uiautomator2
          - name: Render Staging Warm-Up Pre-Flight Probe
            run: |
              npx wait-on -t 90000 https://buggy-books.onrender.com/api/books
              npx wait-on -t 90000 https://buggy-books-fe.onrender.com/
          - name: Run Android Emulator Tests
            uses: reactivecircus/android-emulator-runner@v2
            with:
              api-level: 31
              target: google_apis
              arch: x86_64
              profile: pixel_6
              script: npm run test:mobile:smoke
          - name: Upload Mobile Allure Results
            if: always()
            uses: actions/upload-artifact@v4
            with:
              name: mobile-allure-results
              path: mobile-automation/allure-results/
    ```
  - [ ] Validate workflow schema using actionlint.
- **Acceptance Criteria**:
  - Workflow passes syntax validation.
  - Caches system images and handles Appium server startup.

### User Story US-AF-432: Cross-Platform Local Execution Scripts
- **Story Statement**:  
  *As a* Developer or QA Engineer,  
  *I want* simple one-command scripts to launch Appium and run mobile specs locally on Windows or macOS/Linux,  
  *So that* I can run mobile tests locally without memorizing complex CLI flags.
- **Story Points**: 2 SP (Medium)
- **Technical Subtasks**:
  - [ ] Author `mobile-automation/scripts/run-android-local.ps1` for Windows.
  - [ ] Author `mobile-automation/scripts/run-android-local.sh` for Linux/macOS.
  - [ ] Add root command `npm run test:mobile:smoke` to root `package.json`:
    ```json
    "test:mobile:smoke": "npm run test:android --workspace=mobile-automation -- --spec=src/specs/auth.e2e.spec.ts"
    ```
- **Acceptance Criteria**:
  - Local scripts verify ADB connection before launching WDIO runner.
  - Root command triggers mobile test suite.

---

## 3. Definition of Done & Quality Gates

- [ ] `.github/workflows/mobile-ci.yml` authored and syntax-validated.
- [ ] Render staging warm-up probe included before emulator test execution.
- [ ] Local run scripts authored for both Windows and Linux/macOS.
- [ ] Root `npm run test:mobile:smoke` configured.

---

## 4. Sprint Velocity & Deliverables Summary

| Artifact / File | Type | Target State / Description |
| :--- | :--- | :--- |
| `.github/workflows/mobile-ci.yml` | Workflow | GitHub Actions Android emulator execution pipeline. |
| `mobile-automation/scripts/` | Scripts | Local helper scripts for Windows and POSIX systems. |
| `package.json` | Config | Root script for mobile smoke test dispatch. |
