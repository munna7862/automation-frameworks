# AutomationFrameworks — Monorepo Master Plan & Engineering Roadmap

**Project**: AutomationFrameworks Monorepo  
**Target Application**: BuggyBooks E-Commerce Platform ([Frontend](https://buggy-books-fe.onrender.com) | [Backend](https://buggy-books.onrender.com/api))  
**Core Mission**: Enterprise-grade multi-framework test automation monorepo providing comparative validation, shared tooling, and automated quality gates across Web (Playwright, Selenium, WebdriverIO), Mobile (Appium), and Performance (Apache JMeter, k6).

---

## 1. Executive Summary & Vision

`AutomationFrameworks` is designed as a premier SDET reference architecture. Rather than treating different automation frameworks in isolation, this repository establishes a unified ecosystem where multiple industry-standard tools test the **same** application under realistic conditions:

```
                               ┌────────────────────────────────────────────────────────┐
                               │                 BuggyBooks Application                 │
                               │      (Frontend React 19 + Express API + Chaos Hub)     │
                               └──────────────────────────┬─────────────────────────────┘
                                                          │
             ┌──────────────────────┬─────────────────────┼─────────────────────┬──────────────────────┐
             ▼                      ▼                     ▼                     ▼                      ▼
    ┌─────────────────┐    ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
    │ playwright-e2e  │    │  selenium-e2e   │   │    wdio-e2e     │   │mobile-automation│   │     jmeter      │
    │ (Web UI + API)  │    │ (TypeScript +   │   │  (TypeScript +  │   │(Appium + WDIO   │   │ (Apache JMeter  │
    │ [Chrome Only]   │    │  WebDriver)     │   │   WebdriverIO)  │   │  Android/iOS)   │   │ 5.6+ Suites)    │
    └────────┬────────┘    └────────┬────────┘   └────────┬────────┘   └────────┬────────┘   └────────┬────────┘
             │                      │                     │                     │                     │
             └──────────────────────┴─────────────────────┼─────────────────────┴─────────────────────┘
                                                          │
                               ┌──────────────────────────▼─────────────────────────────┐
                               │              Shared Infrastructure & Gates             │
                               │  - npm workspaces (@automationframeworks/utils)        │
                               │  - Unified PR Quality Gate (.github/workflows/pr-gate) │
                               │  - Centralized Allure Reports on GitHub Pages          │
                               │  - Dual Test Cases Catalog (docs/ & playwright-e2e/)   │
                               └────────────────────────────────────────────────────────┘
```

---

## 2. Current Architecture vs. Target Architecture

### A. Current Directory Structure (Baseline)
```text
AutomationFrameworks/
├── .agents/skills/              # 7 agent skills (some disjoint references)
├── .github/workflows/           # Active CI + 4 dead extensionless files + legacy CRUD
├── docs/                        # Catalog & guides (missing intentional_bugs.md)
├── jmeter/                      # 4 BuggyBooks JMX suites + legacy CRUD test
├── playwright-e2e/              # 110 tests (Chrome UI + API) - healthy
├── playwright-utils/            # Standalone package (unlinked, duplicated in playwright-e2e)
├── selenium-e2e/                # Legacy tests pointing to automationexercise.com / reqres.in
├── wdio-e2e/                    # Legacy tests pointing to automationexercise.com / jsonplaceholder
├── AGENTS.md                    # Core always-on memory
└── .gitignore                   # Ignores .auth, reports, logs
```

### B. Target Architecture (Post-Master Plan Execution)
```text
AutomationFrameworks/
├── package.json                 # Monorepo root workspace configuration
├── AGENTS.md                    # Always-on executive agent memory
├── .gitignore                   # Monorepo-wide artifact & secret filtering
│
├── .agents/                     # Antigravity agent skills & team personas
│   └── skills/                  # Specialized role skills (Architect, Playwright, Selenium, Mobile, JMeter, DevOps)
│
├── .github/                     # Production CI/CD pipelines
│   └── workflows/
│       ├── pr-gate.yml          # Fast-feedback PR verification gate (lint, typecheck, smoke)
│       ├── playwright-ci.yml    # Full regression with Allure Pages deployment
│       ├── playwright-docker.yml# Containerized sharded Playwright execution
│       ├── jmeter-performance.yaml # On-demand Apache JMeter 5.6+ performance suites
│       ├── k6-performance.yaml  # Automated k6 baseline comparison gate
│       ├── mobile-ci.yml        # Appium emulator mobile automation workflow
│       └── quarantine-audit.yml # Automated closed-loop de-quarantine auditor
│
├── docs/                        # Central documentation
│   ├── test_cases_catalog.md    # Dual-catalog master source of truth
│   ├── intentional_bugs.md      # BuggyBooks chaos & anti-pattern testing guide
│   └── architecture/            # Framework comparison benchmarks & design docs
│
├── planning/                    # Structured engineering delivery
│   ├── Master/                  # master_plan.md
│   ├── Phases/                  # phase_1 through phase_5 roadmaps
│   └── Sprints/                 # sprint_x_y execution specs
│
├── packages/
│   └── playwright-utils/        # @automationframeworks/playwright-utils (shared BasePage, logger, helpers)
│
├── playwright-e2e/              # Playwright E2E & API (consumes @automationframeworks/playwright-utils)
├── selenium-e2e/                # Selenium WebDriver TypeScript framework (aligned to BuggyBooks)
├── wdio-e2e/                    # WebdriverIO Web framework (aligned to BuggyBooks)
├── mobile-automation/           # Appium + WebdriverIO Mobile suite (Android & iOS)
├── jmeter/                      # Apache JMeter 5.6+ enterprise load & stress test plans
└── k6-performance/              # k6 developer-centric performance benchmarking & baseline regression gates
```

---

## 3. The 10 Strategic Transformation Pillars

### Pillar 1: Multi-Framework BuggyBooks Parity (Selenium & WebdriverIO)
* **Objective**: Re-align `selenium-e2e` and `wdio-e2e` so they validate the **BuggyBooks** application (`https://buggy-books-fe.onrender.com`), fulfilling the repository's comparative SDET mission.
* **Scope**:
  1. Migrate BuggyBooks Page Objects to Selenium (`selenium-e2e/src/pages/`): `CatalogPage`, `LoginPage`, `CartPage`, `CheckoutPage`.
  2. Migrate BuggyBooks Page Objects to WebdriverIO (`wdio-e2e/src/pages/`).
  3. Implement smoke journeys across both frameworks: User Registration, Login, Catalog Search, Add to Cart, and Order Placement.
  4. Deprecate and remove legacy `automationexercise.com` and `jsonplaceholder` files.
* **Success Criteria**: `npm test` inside `selenium-e2e` and `wdio-e2e` executes green smoke tests against BuggyBooks staging.

---

### Pillar 2: Monorepo Workspaces & `playwright-utils` Package Unification
* **Objective**: Eliminate code duplication between `playwright-utils` and `playwright-e2e` by establishing an npm workspace monorepo.
* **Scope**:
  1. Create a root `package.json` declaring workspaces:
     ```json
     {
       "name": "automation-frameworks-monorepo",
       "private": true,
       "workspaces": [
         "packages/playwright-utils",
         "playwright-e2e",
         "selenium-e2e",
         "wdio-e2e",
         "mobile-automation"
       ],
       "scripts": {
         "lint:all": "npm run lint --workspaces --if-present",
         "typecheck:all": "npm run typecheck --workspaces --if-present",
         "test:smoke:all": "npm run test:smoke --workspace=playwright-e2e"
       }
     }
     ```
  2. Move `playwright-utils/` to `packages/playwright-utils/` and name it `@automationframeworks/playwright-utils`.
  3. Update `playwright-e2e/package.json` to depend on `"@automationframeworks/playwright-utils": "*"` via workspace linking.
  4. Remove duplicated `base.page.ts`, `logger.ts`, and `common.util.ts` from `playwright-e2e/src/core/base/`.
* **Success Criteria**: Zero duplicated utility code; single root `npm install` bootstraps all frameworks cleanly.

---

### Pillar 3: Mobile Test Automation Suite (Appium + WebdriverIO)
* **Objective**: Import the mobile automation suite from `buggy-books` into `AutomationFrameworks`, establishing end-to-end mobile testing capabilities.
* **Scope**:
  1. Import `mobile-automation` from `c:\Workspace\buggy-books\mobile-automation` into `AutomationFrameworks/mobile-automation`.
  2. Retain Appium 2.x configurations (`wdio.android.conf.ts`, `wdio.ios.conf.ts`).
  3. Import Screen Objects: `LoginScreen`, `CatalogScreen`, `CartScreen`, `CheckoutScreen`, `ChaosScreen`, `NavigationTab`.
  4. Import E2E mobile specs: `auth.e2e.spec.ts`, `catalog.e2e.spec.ts`, `checkout_chaos.e2e.spec.ts`, `orientation_chaos.e2e.spec.ts`.
  5. Add test cases to the dual Test Cases Catalog under a new suite: `Suite: Mobile Appium Automation`.
* **Success Criteria**: Mobile automation framework runnable headlessly via Appium CLI and integrated with monorepo linting.

---

### Pillar 4: Intentional Bugs & Chaos Testing Guide (`docs/intentional_bugs.md`)
* **Objective**: Provide an authoritative guide detailing all BuggyBooks intentional failure modes, chaos parameters, and automated testing remediation strategies.
* **Scope**:
  1. Port `intentional_bugs.md` from `buggy-books` into `c:\Workspace\AutomationFrameworks\docs\intentional_bugs.md`.
  2. Document all backend anti-patterns:
     - Payment gateway intermittent failure (`checkoutFailureRate: 0.15`).
     - Delayed inventory report (`inventoryDelayMs: 3000`).
     - Session sandboxing & data isolation (`x-test-session-id`).
     - Express rate limiting (`429 Too Many Requests`).
  3. Document all UI anti-patterns:
     - Obfuscated selectors & missing `data-testid` attributes.
     - Dynamic button latency (500–3500ms).
     - Shadow DOM encapsulation (`<order-summary-box>`).
     - Visual layout chaos (`visualChaos: true`).
* **Success Criteria**: 100% compliance with `doc-implementation-standards` skill.

---

### Pillar 5: CI/CD Workflow Modernization & Pipeline Hygiene
* **Objective**: Purge broken, extensionless, and redundant workflow files from `.github/workflows/` and standardize active pipelines.
* **Scope**:
  1. Delete the 4 extensionless dead files:
     - `.github/workflows/Playwright Automation CI (Sharded)`
     - `.github/workflows/Playwright Automation CI - Docker (Sharded Optimized)`
     - `.github/workflows/Playwright Automation CI - Docker (Sharded)`
     - `.github/workflows/Playwright Automation CI - Kubernetes (Sharded Optimized)`
  2. Remove legacy `performance-crud.yaml` (fully superseded by `jmeter-performance.yaml`).
  3. Standardize naming on kebab-case `.yml` extensions.
  4. Ensure every staging workflow contains the mandatory Render pre-flight warm-up probe.
* **Success Criteria**: Clean `.github/workflows/` directory with zero orphaned, unparseable, or dead workflows.

---

### Pillar 6: Standardized Environment Configuration Templates (`.env.example`)
* **Objective**: Provide clear, self-documenting `.env.example` templates across the entire monorepo.
* **Scope**:
  1. Create root `.env.example` defining global workspace variables.
  2. Create `playwright-e2e/.env.example` with documented keys:
     - `BASE_URL`, `API_BASE_URL`, `ENV`, `HEADLESS`, `BROWSER`, `USER_NAME`, `PASSWORD`, `JWT_SECRET`, `ELEMENT_TIMEOUT`.
  3. Create matching `.env.example` templates for `selenium-e2e/`, `wdio-e2e/`, and `mobile-automation/`.
* **Success Criteria**: Zero missing environment variable confusion for new developers and CI pipelines.

---

### Pillar 7: Visual Regression Snapshot Calibration for Project `chrome`
* **Objective**: Ensure Playwright visual regression tests execute seamlessly against calibrated golden baselines for Google Chrome.
* **Scope**:
  1. Align baseline snapshots in `playwright-e2e/src/tests/ui/VisualRegression/Test_010_VisualRegressionChaos.spec.ts-snapshots/`.
  2. Add calibrated snapshots for `chrome`:
     - `catalog-baseline-chrome-linux.png`
     - `catalog-baseline-chrome-win32.png`
  3. Verify `VIS_REG_01` (Baseline Catalog Screenshot) and `VIS_REG_02` (Chaos Pixel Diff) pass cleanly in CI.
* **Success Criteria**: Visual regression test suite passes 100% green without false-positive diff failures.

---

### Pillar 8: Dual-Engine Performance Strategy (Apache JMeter + k6 Synergy)
* **Objective**: Provide a dual performance engineering capability combining developer-centric fast-feedback benchmarking (k6) with enterprise stress/load generation (JMeter).
* **Scope**:
  1. Retain Apache JMeter suites in `jmeter/` (`BuggyBooks_Catalog_Load`, `BuggyBooks_Auth_Stress`, `BuggyBooks_Ecommerce_Journey`, `BuggyBooks_Inventory_Stress`).
  2. Import `performance/` from `buggy-books` into `AutomationFrameworks/k6-performance/`.
  3. Retain k6 golden baseline regression gates (`baseline-perf.json`, `report-perf-summary.js`).
  4. Add `.github/workflows/k6-performance.yaml` with automated baseline drift comparison (`((current - baseline) / baseline) * 100 <= 20%`).
  5. Harmonize `docs/test_cases_catalog.md` so both `TC-PERF-001..005` (k6) and `TC-PERF-JM-001..004` (JMeter) are fully covered and verified.
* **Success Criteria**: Dual performance toolchains operational, covering PR-level relative regression (k6) and scheduled endurance/capacity stress (JMeter).

---

### Pillar 9: Unified Pull Request Quality Gate (`pr-gate.yml`)
* **Objective**: Prevent broken code, lint failures, and regressions from ever being merged into `main`.
* **Scope**:
  1. Create `.github/workflows/pr-gate.yml` triggered automatically on `pull_request: [main]`.
  2. Stage 1: Fast Static Quality Gate (monorepo linting + typechecking in parallel across workspaces).
  3. Stage 2: Render Pre-Flight Probe (`wait-on` frontend and backend).
  4. Stage 3: Playwright Smoke Gate (`npm run test:smoke` executing 100% green on Chrome UI + API).
  5. Stage 4: Automated PR Commenter / Step Summary publishing test status and failure traces.
  6. Enforce strict exit code 1 on any failure to block PR merge.
* **Success Criteria**: Zero unprotected commits merged to `main`; fast-feedback cycle completed in < 3 minutes.

---

### Pillar 10: Centralized Multi-Framework Allure Reporting on GitHub Pages
* **Objective**: Aggregate test execution reporting across all frameworks into an executive, unified Allure portal on GitHub Pages.
* **Scope**:
  1. Structure the GitHub Pages deployment to support multiple test categories:
     - `https://munna7862.github.io/automation-frameworks/AutomationReports/Playwright/`
     - `https://munna7862.github.io/automation-frameworks/AutomationReports/JMeter/`
     - `https://munna7862.github.io/automation-frameworks/AutomationReports/Selenium/`
     - `https://munna7862.github.io/automation-frameworks/AutomationReports/WDIO/`
     - `https://munna7862.github.io/automation-frameworks/AutomationReports/Mobile/`
  2. Implement an interactive root landing page (`index.html`) on `gh-pages` displaying real-time badges, latest run timestamps, pass rates, and direct links to each sub-dashboard.
* **Success Criteria**: Single URL provides complete visibility across all automation disciplines.

---

## 📅 Roadmap: Phased Delivery & Sprint Decomposition Preview

The 10 pillars will be delivered through a structured 5-Phase, 15-Sprint lifecycle:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 1: Monorepo Foundations, Pipeline Hygiene & Utility Unification                  │
│ ├─ Sprint 1.1: Workflow Cleanup & Extensionless File Purge (Pillar 5)                  │
│ ├─ Sprint 1.2: Standardized Environment Templates & Visual Baseline Calibration (P6,7)│
│ └─ Sprint 1.3: Monorepo Workspaces & @automationframeworks/playwright-utils (Pillar 2) │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 2: Documentation Integrity, Anti-Pattern Manual & Quality Gates                  │
│ ├─ Sprint 2.1: Intentional Bugs & Chaos Testing Guide (Pillar 4)                       │
│ ├─ Sprint 2.2: Dual-Engine Performance Strategy & k6 Migration (Pillar 8)             │
│ └─ Sprint 2.3: Unified Pull Request CI Quality Gate (pr-gate.yml) (Pillar 9)           │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 3: WebdriverIO & Selenium Alignment to BuggyBooks                                │
│ ├─ Sprint 3.1: BuggyBooks Selenium Page Objects & Auth/Catalog Smoke (Pillar 1)        │
│ ├─ Sprint 3.2: BuggyBooks WebdriverIO Page Objects & Cart/Checkout Flows (Pillar 1)    │
│ └─ Sprint 3.3: Cross-Framework Parity Assertions & Traceability Matrix Sync (Pillar 1) │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 4: Mobile Automation (Appium + WebdriverIO)                                      │
│ ├─ Sprint 4.1: Mobile Automation Monorepo Import & Scaffolding (Pillar 3)              │
│ ├─ Sprint 4.2: Appium Android/iOS Smoke & Chaos E2E Verification (Pillar 3)            │
│ └─ Sprint 4.3: Mobile CI Pipeline & Emulator Execution Workflows (Pillar 3)            │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 5: Executive Observability & Unified Allure Dashboard                            │
│ ├─ Sprint 5.1: Multi-Framework Allure Result Aggregation Architecture (Pillar 10)     │
│ ├─ Sprint 5.2: GitHub Pages Portal Landing Page & Executive KPI Badging (Pillar 10)    │
│ └─ Sprint 5.3: Automated Monorepo Health Auditing & Closed-Loop Governance (Pillar 10) │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 👥 Sprint Team & Agent Skills Matrix

To execute sprint-by-sprint with zero token waste and complete domain autonomy, we will establish a **specialized virtual sprint team** backed by dedicated agent skill files in `.agents/skills/`:

| Sprint Team Role | Agent Persona | Dedicated Skill File | Primary Responsibilities |
| :--- | :--- | :--- | :--- |
| **Scrum Master** | Agile Delivery Lead | [**`role-scrum-master`**](../../.agents/skills/role-scrum-master/SKILL.md) | Sprint ceremonies, 63 SP velocity tracking, DoR/DoD enforcement, blocker removal. |
| **SDET Architect** | Lead Architect & Governance | [**`role-sdet-architect`**](../../.agents/skills/role-sdet-architect/SKILL.md) | Test strategy, dual-catalog sync, monorepo workspaces, review gates. |
| **Playwright QA Lead** | Playwright Specialist | [**`role-playwright-automation`**](../../.agents/skills/role-playwright-automation/SKILL.md) | Chrome UI + API specs, POM maintenance, self-healing, visual regression. |
| **Selenium Specialist** | Selenium Automation Engineer | [**`role-selenium-specialist`**](../../.agents/skills/role-selenium-specialist/SKILL.md) | Selenium WebDriver POMs, TypeScript typings, driver factory, BuggyBooks sync. |
| **Mobile QA Specialist** | Appium / Mobile Engineer | [**`role-mobile-appium-specialist`**](../../.agents/skills/role-mobile-appium-specialist/SKILL.md) | Appium 2.x, WDIO mobile configs, Screen Objects, mobile chaos testing. |
| **Performance Engineer** | Load & Stress Specialist | [**`role-performance-engineer`**](../../.agents/skills/role-performance-engineer/SKILL.md) | Apache JMeter JMX test plans, k6 scenarios, baseline regression gates, SLAs. |
| **DevOps / Release Lead** | CI/CD Platform Engineer | [**`role-devops-engineer`**](../../.agents/skills/role-devops-engineer/SKILL.md) | GitHub Actions, Render warm-up probes, Allure Pages deployment, PR gates. |

---

## 🏁 Verification & Release Criteria

Every phase and sprint must pass the four-stage verification protocol before release:
1. **Static Analysis**: `npm run lint` and `npm run typecheck` across all active packages exit 0.
2. **Deterministic Green Execution**: All newly migrated or authored specs pass 100% cleanly without skipped or flaky tests.
3. **Traceability Parity**: Both `docs/test_cases_catalog.md` and `playwright-e2e/test_cases_catalog.md` maintain 100% identical row entries.
4. **Git & PR Hygiene**: Conventional commit formatting with verified execution logs in the pull request description.
