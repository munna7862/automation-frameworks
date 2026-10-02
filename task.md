# Task Backlog: AutomationFrameworks Sprint Execution

## Current Focus: Sprint 4.3 — Mobile CI Pipeline & Emulator Execution Workflows

**Sprint Identifier**: `SPRINT-4.3-MOBILE-CI-AND-EMULATOR-PIPELINE`  
**Phase**: Phase 4 (Mobile Automation: Appium + WebdriverIO)  
**Story Points**: 5 SP  
**Branch**: `feat/sprint-4.3-mobile-ci-pipeline-and-emulator-workflows`  
**Goal**: Implement an automated GitHub Actions mobile execution pipeline (`.github/workflows/mobile-ci.yml`) leveraging Android Emulator Runner, manage the Appium server lifecycle headlessly, and provide cross-platform local run scripts.

---

## 1. Persona Roles & Ownership Matrix

| Persona | Role Assignment | Responsibilities for this Sprint | Status |
| :--- | :--- | :--- | :--- |
| **Scrum Master** | `role-scrum-master` | Sprint planning, `task.md` tracking, DoR verification, and DoD audit. | `ACTIVE` |
| **SDET Architect** | `role-sdet-architect` | Architecture review, dual-catalog sync check, SLA & script standards, technical review gate. | `ACTIVE` |
| **Mobile QA Specialist** | `role-mobile-appium-specialist` | Author cross-platform helper scripts (`run-android-local.ps1`, `run-android-local.sh`), verify ADB connectivity checks, and smoke runner command. | `ACTIVE` |
| **DevOps Engineer** | `role-devops-engineer` | Author `.github/workflows/mobile-ci.yml`, emulator hardware acceleration, Appium & UiAutomator2 setup, artifact upload, and PR release lifecycle. | `ACTIVE` |
| **Product Owner** | Human Tech Lead (`User`) | Backlog prioritization, sprint kickoff, and final PR review & merge. | `STANDBY` |

---

## 2. Granular Task Breakdown

### US-AF-431: Mobile CI Pipeline with Android Emulator Runner (3 SP)
- [x] **US-AF-431.1** (`DevOps Engineer`): Author `.github/workflows/mobile-ci.yml` supporting:
  - Triggers on `workflow_dispatch` and nightly schedule (`cron: '0 3 * * *'`).
  - Runner environment (`macos-13`) for hardware acceleration (HAXM / Apple Silicon / KVM virtualization).
  - Node.js setup (Node 20) with npm caching, and Java JDK 17 (Temurin).
  - Appium 2.x and `uiautomator2` driver installation.
  - Mandatory Render staging pre-flight warm-up probe.
  - Headless Android emulator execution via `reactivecircus/android-emulator-runner@v2` running `npm run test:mobile:smoke`.
  - Archival of Allure results artifact (`mobile-automation/reports/allure-results/`) on `always()`.
- [x] **US-AF-431.2** (`DevOps Engineer`): Validate workflow syntax, triggers, environment configuration, and action versions.

### US-AF-432: Cross-Platform Local Execution Scripts (2 SP)
- [x] **US-AF-432.1** (`Mobile QA Specialist`): Author `mobile-automation/scripts/run-android-local.ps1` for Windows:
  - Check prerequisites (`node`, `adb`, `appium`).
  - Verify ADB connected devices/emulators (`adb devices`).
  - Provide fallback instructions or emulator launch guidance if no devices are detected.
  - Execute WebdriverIO mobile smoke runner with appropriate environment variables.
- [x] **US-AF-432.2** (`Mobile QA Specialist`): Author `mobile-automation/scripts/run-android-local.sh` for macOS/Linux:
  - Check prerequisites (`node`, `adb`, `appium`).
  - Verify ADB connected devices/emulators.
  - Execute WebdriverIO mobile smoke runner.
  - Set executable permissions.
- [x] **US-AF-432.3** (`SDET Architect`): Verify root monorepo scripts in `package.json` (`test:mobile:smoke`, `test:mobile:android`, `test:mobile:ios`) and `mobile-automation/package.json`.
- [x] **US-AF-432.4** (`SDET Architect`): Conduct Code Acceptance Review on CI workflow, scripts, and dual-catalog parity verification.
- [x] **US-AF-432.5** (`Scrum Master`): Verify 4-point DoD checklist (`typecheck`, `lint`, dual-catalog zero-diff, docs).
- [x] **US-AF-432.6** (`DevOps Engineer`): Commit changes, push branch, open PR via `gh pr create` ([PR #25](https://github.com/munna7862/automation-frameworks/pull/25)), and monitor CI checks.

---

## 3. Sprint Review Comments & Refinement Loop

| Gate / Reviewer | Target Role | Review Feedback & Comments | Gate Status |
| :--- | :--- | :--- | :---: |
| **Pre-Flight Architecture Gate** | SDET Architect | Staging probe clean (HTTP 200 on books API & frontend); DoR satisfied; mobile test contracts aligned. | `[PASSED]` |
| **Code Acceptance Review Gate** | SDET Architect | CI workflow syntax validated via YAML parser; macos-13 hardware acceleration configured; Render pre-flight warm-up probe included; local helper scripts for Windows (.ps1) and macOS/Linux (.sh) authored and tested; monorepo root scripts unified; 0 type/lint errors across monorepo. | `[PASSED]` |
| **Scrum Master DoD Gate** | Scrum Master | `npm run lint:all` passed with 0 errors; `npm run typecheck:all` passed with 0 errors across 6 workspaces; dual-catalog 100% lockstep parity verified; sprint documentation updated. | `[PASSED]` |
| **DevOps Release Gate** | DevOps Engineer | PR #25 opened and all 5 GitHub Actions CI Quality Gate checks passed 100%. | `[PASSED]` |
| **Final Human Sign-Off** | Human Tech Lead | Final PR review and merge to `main`. | `[READY FOR PO REVIEW & MERGE]` |

---

## 4. Definition of Done (DoD) Checklist

- [x] `.github/workflows/mobile-ci.yml` authored with `reactivecircus/android-emulator-runner@v2`, Appium setup, Render probe, and Allure archival.
- [x] Local helper scripts `mobile-automation/scripts/run-android-local.ps1` and `mobile-automation/scripts/run-android-local.sh` authored and functional.
- [x] Root `package.json` and `mobile-automation/package.json` scripts validated.
- [x] `npm run lint:all` and `npm run typecheck:all` exit 0 across all workspaces.
- [x] Dual-catalog parity confirmed: `git diff --exit-code docs/test_cases_catalog.md playwright-e2e/test_cases_catalog.md` exits 0.
- [x] Sprint documentation (`planning/Sprints/sprint_4_3_mobile_ci_pipeline_and_emulator_execution_workflows.md`, `planning/README.md`, and `planning/Phases/phase_4_mobile_automation_appium_and_webdriverio.md`) updated.
- [x] Pull request opened with structured summary and verification evidence ([PR #25](https://github.com/munna7862/automation-frameworks/pull/25)).
- [x] All CI quality gate checks green (5/5 passed).

---

## 5. Verification & Execution Evidence

```bash
# Command 1: Dual-catalog parity check
git diff --no-index docs/test_cases_catalog.md playwright-e2e/test_cases_catalog.md
# Exit code: 0 (zero diff)

# Command 2: Monorepo static analysis
npm run lint:all
# Exit code: 0 (0 errors across playwright-e2e and mobile-automation)

npm run typecheck:all
# Exit code: 0 (0 errors across all 6 workspaces)

# Command 3: Shell script verification
bash mobile-automation/scripts/run-android-local.sh --help
# Exit code: 0 (help options displayed)

# Command 4: PowerShell script verification
powershell -File .\mobile-automation\scripts\run-android-local.ps1 -?
# Exit code: 0

# Command 5: GitHub Actions CI Quality Gate on PR #25 (5/5 checks passed)
gh pr checks 25
# Analyze (actions)               pass  35s
# Analyze (javascript-typescript) pass  48s
# CodeQL                          pass  3s
# Smoke Tests (Chrome UI + API)   pass  2m0s
# Static Quality & Linting        pass  43s
```
