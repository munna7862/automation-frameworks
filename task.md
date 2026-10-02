# Task Backlog: AutomationFrameworks Sprint Execution

## Current Focus: Sprint 5.1 — Multi-Framework Allure Result Aggregation Architecture

**Sprint Identifier**: `SPRINT-5.1-ALLURE-AGGREGATION-ARCHITECTURE`  
**Phase**: Phase 5 (Executive Observability & Unified Allure Dashboard)  
**Story Points**: 4 SP  
**Branch**: `feat/sprint-5.1-allure-aggregation-architecture`  
**Goal**: Establish a standardized Allure results generation and namespaced publishing architecture across Playwright, JMeter, Selenium, WebdriverIO, and Mobile, preserving historical trend data on the `gh-pages` branch.

---

## 1. Persona Roles & Ownership Matrix

| Persona | Role Assignment | Responsibilities for this Sprint | Status |
| :--- | :--- | :--- | :--- |
| **Scrum Master** | `role-scrum-master` | Sprint planning, `task.md` tracking, DoR verification, and DoD audit. | `ACTIVE` |
| **SDET Architect** | `role-sdet-architect` | Define directory standards (`allure-results/`), metadata specification, dual-catalog sync audit, and technical review gate. | `ACTIVE` |
| **Playwright QA Lead** | `role-playwright-automation` | Standardize `playwright-e2e` Allure reporter, npm scripts, and environment metadata generation. | `ACTIVE` |
| **Automation Specialist** | `role-selenium-specialist` / `role-mobile-appium-specialist` | Standardize Allure configurations in `selenium-e2e`, `wdio-e2e`, and `mobile-automation`. | `ACTIVE` |
| **DevOps Engineer** | `role-devops-engineer` | Namespaced `gh-pages` deployment architecture, history preservation, CI workflows (`playwright-ci`, `selenium-ci`, `wdio-ci`, `mobile-ci`, `jmeter-performance`), and PR lifecycle. | `ACTIVE` |
| **Product Owner** | Human Tech Lead (`User`) | Backlog prioritization, sprint kickoff, and final PR review & merge. | `STANDBY` |

---

## 2. Granular Task Breakdown

### US-AF-511: Cross-Framework Allure Configuration Standardization (2 SP)
- [x] **US-AF-511.1** (`SDET Architect`): Define directory standards (`<framework>/allure-results/`) and environment properties specification across all frameworks.
- [x] **US-AF-511.2** (`Automation Specialist`): Standardize Allure reporter output directory to `allure-results/` in `playwright-e2e`, `selenium-e2e`, `wdio-e2e`, and `mobile-automation`.
- [x] **US-AF-511.3** (`Automation Specialist`): Implement automated `environment.properties` generation capturing framework version, OS, browser channel (`chrome`), and staging URL across all frameworks.
- [x] **US-AF-511.4** (`SDET Architect`): Verify test run outputs valid XML/JSON results in local `allure-results/` with clean environment metadata.

### US-AF-512: Namespaced GitHub Pages Deployment Pipeline (2 SP)
- [x] **US-AF-512.1** (`DevOps Engineer`): Standardize `gh-pages` deployment architecture with namespaced directories: `AutomationReports/{Playwright,JMeter,Selenium,WDIO,Mobile,k6}`.
- [x] **US-AF-512.2** (`DevOps Engineer`): Update `.github/workflows/playwright-ci.yml` and `mobile-ci.yml` with history preservation and namespaced deployment (`peaceiris/actions-gh-pages@v3`, `keep_files: true`).
- [x] **US-AF-512.3** (`DevOps Engineer`): Author `.github/workflows/selenium-ci.yml` and `.github/workflows/wdio-ci.yml` with Chrome headless execution, Allure generation, history pulling, and namespaced deployment.
- [x] **US-AF-512.4** (`DevOps Engineer`): Update `.github/workflows/jmeter-performance.yaml` to publish HTML dashboard reports to `AutomationReports/JMeter` on `gh-pages`.
- [x] **US-AF-512.5** (`SDET Architect`): Author comprehensive documentation `docs/architecture/reporting_architecture.md`.
- [x] **US-AF-512.6** (`Scrum Master`): Verify 4-point DoD checklist (`typecheck`, `lint`, dual-catalog parity, docs).
- [x] **US-AF-512.7** (`DevOps Engineer`): Commit changes, push branch, open PR via `gh pr create` (PR #26), and monitor CI checks.

---

## 3. Sprint Review Comments & Refinement Loop

| Gate / Reviewer | Target Role | Review Feedback & Comments | Gate Status |
| :--- | :--- | :--- | :---: |
| **Pre-Flight Architecture Gate** | SDET Architect | Staging pre-flight probe completed clean; dual-catalog parity confirmed; DoR satisfied. | `[PASSED]` |
| **Code Acceptance Review Gate** | SDET Architect | All 4 web and mobile frameworks output to standardized `allure-results/` with rich `environment.properties`; history injection verified; single-browser policy intact. | `[PASSED]` |
| **Scrum Master DoD Gate** | Scrum Master | `typecheck:all` exit 0, `lint:all` exit 0, zero dual-catalog diff, and architecture doc published. | `[PASSED]` |
| **DevOps Release Gate** | DevOps Engineer | Workflows authored with concurrency locks (`pages-deploy-allure`) and namespaced deployments (`AutomationReports/<Framework>`); all CI checks passed on PR #26. | `[PASSED]` |
| **Final Human Sign-Off** | Human Tech Lead | PR #26 approved, squashed, and merged to `main`. | `[PASSED]` |

---

## 4. Definition of Done (DoD) Checklist

- [x] All 4 web and mobile frameworks produce valid Allure result outputs in their local `allure-results/` directory.
- [x] Environment properties (`environment.properties`) capture framework version, OS, browser channel (`chrome`), and staging URLs.
- [x] `gh-pages` branch architecture cleanly partitions reports by framework (`AutomationReports/{Playwright,JMeter,Selenium,WDIO,Mobile,k6}`).
- [x] History retention logic verified; `history/` directory pulled from prior deployment to maintain trend charts.
- [x] CI deployment uses `keep_files: true` to prevent clobbering other framework reports.
- [x] `npm run lint:all` and `npm run typecheck:all` pass across all active workspaces with 0 errors.
- [x] Dual-catalog parity confirmed: `git diff --exit-code docs/test_cases_catalog.md playwright-e2e/test_cases_catalog.md` exits 0.
- [x] Architecture documentation authored: `docs/architecture/reporting_architecture.md`.
- [x] Pull request opened with structured summary and verification evidence (`gh pr create` - PR #26).
- [x] All CI workflow checks green, approved, and merged to `main`.

---

## 5. Verification & Execution Evidence

```bash
# Command 1: Dual-catalog parity check
git diff --exit-code docs/test_cases_catalog.md playwright-e2e/test_cases_catalog.md

# Command 2: Monorepo Static Analysis
npm run lint:all
npm run typecheck:all

# Command 3: Allure results and environment validation
npm run test:smoke --workspace=playwright-e2e
npm run test:smoke --workspace=selenium-e2e
npm run test:smoke --workspace=wdio-e2e
```
