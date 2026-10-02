# Task Backlog: AutomationFrameworks Sprint Execution

## Current Focus: Sprint 5.2 — GitHub Pages Portal Landing Page & Executive KPI Badging

**Sprint Identifier**: `SPRINT-5.2-GITHUB-PAGES-PORTAL-LANDING-PAGE`  
**Phase**: Phase 5 (Executive Observability & Unified Allure Dashboard)  
**Story Points**: 5 SP  
**Branch**: `feat/sprint-5.2-portal-landing-page`  
**Goal**: Create a state-of-the-art executive reporting portal (`index.html`) deployed to the root of GitHub Pages, featuring interactive framework cards, real-time KPI metrics, and direct links to sub-framework Allure and JMeter dashboards.

---

## 1. Persona Roles & Ownership Matrix

| Persona | Role Assignment | Responsibilities for this Sprint | Status |
| :--- | :--- | :--- | :--- |
| **Scrum Master** | `role-scrum-master` | Sprint kick-off, `task.md` tracking, DoR verification, and DoD audit. | `ACTIVE` |
| **SDET Architect** | `role-sdet-architect` | Designing portal architecture, layout, executive KPIs, automated metrics aggregator schema, and code acceptance review. | `ACTIVE` |
| **Playwright QA Lead** | `role-playwright-automation` | Reviewing test metrics presentation, verifying deep-link routing, and local UI rendering audit. | `ACTIVE` |
| **DevOps Engineer** | `role-devops-engineer` | Integrating portal metadata generation & deployment into CI release pipelines (`playwright-ci`, `gh-pages`), and opening PR via `gh pr create`. | `ACTIVE` |
| **Product Owner** | Human Tech Lead (`User`) | Backlog prioritization, sprint kickoff, and final PR review & merge. | `STANDBY` |

---

## 2. Granular Task Breakdown

### US-AF-521: Executive Portal UI Design & Implementation (3 SP)
- [x] **US-AF-521.1** (`SDET Architect`): Design responsive portal layout structure, color tokens, and executive KPI card hierarchy.
- [x] **US-AF-521.2** (`Playwright QA Lead`): Implement `docs/portal/index.html` with modern dark glassmorphism aesthetic, interactive framework cards, real-time status badges, and relative deep-links to sub-framework reports:
  - Playwright E2E & API (`./AutomationReports/Playwright/`)
  - Apache JMeter Performance (`./AutomationReports/JMeter/`)
  - Selenium WebDriver (`./AutomationReports/Selenium/`)
  - WebdriverIO (`./AutomationReports/WDIO/`)
  - Appium Mobile (`./AutomationReports/Mobile/`)
  - k6 Performance (`./AutomationReports/k6/`)
- [x] **US-AF-521.3** (`Playwright QA Lead`): Implement client-side dynamic hydration script fetching `portal-data.json` to populate live metrics, pass rates, test counts, durations, and environment badging with graceful offline fallbacks.
- [x] **US-AF-521.4** (`Playwright QA Lead`): Verify visual rendering across mobile and desktop viewport profiles via browser inspection (`npm run test:portal`).

### US-AF-522: Automated Portal Metadata Aggregator Script & CI Integration (2 SP)
- [x] **US-AF-522.1** (`SDET Architect`): Design `portal-data.json` schema and aggregator algorithm parsing Allure `widgets/summary.json` and JMeter metrics.
- [x] **US-AF-522.2** (`SDET Architect`): Implement `scripts/generate-portal-metadata.js` with comprehensive CLI support (`--gh-pages-dir`, `--output`, `--summary`), extracting metrics across all 6 frameworks and computing aggregate executive KPIs.
- [x] **US-AF-522.3** (`DevOps Engineer`): Add portal generation and root `gh-pages` deployment step to GitHub Actions pipelines (`playwright-ci.yml`, `selenium-ci.yml`, `wdio-ci.yml`, `mobile-ci.yml`, `jmeter-performance.yaml`) using `peaceiris/actions-gh-pages@v3` with `keep_files: true`.
- [x] **US-AF-522.4** (`SDET Architect`): Conduct Code Acceptance Review and sign off technical quality gate.
- [x] **US-AF-522.5** (`Scrum Master`): Verify 4-point DoD checklist (`typecheck:all`, `lint:all`, zero catalog diff, and planning/documentation updates).
- [ ] **US-AF-522.6** (`DevOps Engineer`): Push branch, open PR via `gh pr create`, monitor CI checks, and await PO sign-off.

---

## 3. Sprint Review Comments & Refinement Loop

| Gate / Reviewer | Target Role | Review Feedback & Comments | Gate Status |
| :--- | :--- | :--- | :---: |
| **Pre-Flight Architecture Gate** | SDET Architect | Staging pre-flight probe completed (200 OK); dual-catalog parity confirmed; DoR satisfied. | `[PASSED]` |
| **Code Acceptance Review Gate** | SDET Architect | Dark glassmorphism UI verified; all 6 framework cards link with portable relative paths; dynamic hydration and graceful offline fallbacks verified; automated aggregator parses Allure summaries accurately. | `[PASSED]` |
| **Scrum Master DoD Gate** | Scrum Master | `typecheck:all` exit 0, `lint:all` exit 0, `test:portal` passed across desktop and mobile, zero dual-catalog diff, roadmap synchronized. | `[PASSED]` |
| **DevOps Release Gate** | DevOps Engineer | Validate CI workflows, PR creation, and green CI status. | `[ACTIVE]` |
| **Final Human Sign-Off** | Human Tech Lead | Final PR review and merge to `main`. | `[PENDING]` |

---

## 4. Definition of Done (DoD) Checklist

- [x] `docs/portal/index.html` authored with responsive dark-mode glassmorphic styling, executive KPI metrics, and framework cards.
- [x] All 6 framework cards link seamlessly to relative report subpaths (`./AutomationReports/<Framework>/`).
- [x] `scripts/generate-portal-metadata.js` accurately parses Allure `widgets/summary.json` and produces valid `portal-data.json`.
- [x] Client-side script hydrates live metrics dynamically with robust fallback for offline / mock states.
- [x] CI deployment updates root of `gh-pages` branch without clobbering sub-reports.
- [x] `npm run lint:all` and `npm run typecheck:all` pass across all active workspaces with 0 errors.
- [x] Dual-catalog parity confirmed: `git diff --exit-code docs/test_cases_catalog.md playwright-e2e/test_cases_catalog.md` exits 0.
- [x] Sprint roadmap in `planning/README.md` and sprint plan updated.
- [ ] Pull request opened with structured summary and verification evidence (`gh pr create`).
- [ ] All CI workflow checks green, approved, and merged to `main`.

---

## 5. Verification & Execution Evidence

```bash
# Command 1: Dual-catalog parity check
git diff --exit-code docs/test_cases_catalog.md playwright-e2e/test_cases_catalog.md

# Command 2: Monorepo Static Analysis
npm run lint:all
npm run typecheck:all

# Command 3: Portal Metadata Generation Test
node scripts/generate-portal-metadata.js --output docs/portal/portal-data.json
```
