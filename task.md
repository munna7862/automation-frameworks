# Task Backlog: AutomationFrameworks Sprint Execution

## Current Focus: Sprint 10.1 — UI Determinism & Lint Enforcement

**Sprint Identifier**: `SPRINT-10.1-UI-DETERMINISM-AND-LINT`  
**Phase**: Phase 10 (UI Quality — Determinism, Accessibility, Web Vitals & Framework Parity)  
**Story Points**: 4 SP  
**Branch**: `feat/sprint-10.1-ui-determinism`  
**Goal**: Eliminate hard waits, enforce deterministic patterns through ESLint, catch new flaky tests before merge with burn-in, and add mock-driven tests for hard-to-reach UI states.

---

## 1. Persona Roles & Ownership Matrix

| Persona                | Role Assignment              | Responsibilities for this Sprint                                                                    | Status    |
| :--------------------- | :--------------------------- | :-------------------------------------------------------------------------------------------------- | :-------- |
| **Scrum Master**       | `role-scrum-master`          | Sprint planning, `task.md` governance, DoR verification, DoD audit, and velocity tracking.          | `ACTIVE`  |
| **SDET Architect**     | `role-sdet-architect`        | ESLint rules design, dual-catalog sync (`UI-EDGE-*`), code review checklist audit, Quality Gate.    | `ACTIVE`  |
| **Playwright QA Lead** | `role-playwright-automation` | Eliminate hard waits, author `Test_001_MockedEdgeStates.spec.ts`, HAR recording script & redaction. | `ACTIVE`  |
| **DevOps Engineer**    | `role-devops-engineer`       | PR burn-in CI job in `pr-gate.yml`, fetch-depth config, step summary formatting, PR release.        | `ACTIVE`  |
| **Product Owner**      | Human Tech Lead (`User`)     | Backlog prioritization, review gate approvals, final PR merge to `main`.                            | `STANDBY` |

---

## 2. Granular Task Breakdown

### US-AF-1011: Remove Hard Waits (1 SP) — Deterministic Replacements

- [x] **US-AF-1011.1** (`Playwright QA Lead`): Replace hard waits in `src/tests/ui/A11y/Test_007_A11yScanValidation.spec.ts` (lines 20, 35) with web-first assertion and `document.getAnimations()` / layout stability function.
- [x] **US-AF-1011.2** (`Playwright QA Lead`): Replace hard wait in `src/tests/ui/Refresh/Test_006_JwtRefreshValidation.spec.ts` (line 38) with `expect.poll` / deterministic token verification.
- [x] **US-AF-1011.3** (`Playwright QA Lead`): Replace hard wait in `src/tests/api/UserManagement/Test_002_TokenRefreshAndProfileApi.spec.ts` (line 47) with deterministic token polling.
- [x] **US-AF-1011.4** (`Playwright QA Lead`): Replace hard waits in `src/tests/ui/VisualRegression/Test_010_VisualRegressionChaos.spec.ts` (lines 19, 262) with layout stability polling and web-first locators.
- [x] **US-AF-1011.5** (`Playwright QA Lead`): Audit entire repository to ensure 0 remaining `new Promise(r => setTimeout(r, ...))` or `waitForTimeout` calls in `playwright-e2e/src/tests`.

### US-AF-1012: ESLint Enforcement (1 SP) — Lint Guards

- [x] **US-AF-1012.1** (`SDET Architect`): Configure ESLint rules in `playwright-e2e/eslint.config.mjs`:
  - `playwright/no-wait-for-timeout: error`
  - `playwright/no-force-option: error`
  - `playwright/prefer-web-first-assertions: error`
  - `playwright/no-conditional-in-test: warn`
  - `playwright/no-networkidle: error`
  - `playwright/no-element-handle: error`
  - `playwright/no-page-pause: error`
  - `playwright/no-focused-test: error`
- [x] **US-AF-1012.2** (`SDET Architect`): Add `no-restricted-syntax` in `playwright-e2e/eslint.config.mjs` for `src/tests/**` banning `setTimeout` inside `new Promise` ("Use expect.poll / web-first assertions").
- [x] **US-AF-1012.3** (`SDET Architect`): Add `no-restricted-syntax` / rules for `src/tests/**` regarding raw locator usage in test specs (locators belong in `src/pages/**` / POMs).
- [x] **US-AF-1012.4** (`SDET Architect`): Mirror hard-wait bans in `selenium-e2e/eslint.config.mjs` (`driver.sleep` ban) and upgrade `wdio-e2e/eslint.config.mjs` (`wdio/no-pause` to `error`, replace any remaining `browser.pause`).

### US-AF-1013: PR Burn-In for Changed Specs (1 SP) — Flake Prevention

- [x] **US-AF-1013.1** (`DevOps Engineer`): Add `burn-in` job in `.github/workflows/pr-gate.yml` running after `smoke-e2e` on ephemeral `ENV=DOCKER`.
- [x] **US-AF-1013.2** (`DevOps Engineer`): Configure `fetch-depth: 0` and `--only-changed=origin/main --repeat-each=5 --retries=0 --workers=4`.
- [x] **US-AF-1013.3** (`DevOps Engineer`): Implement graceful no-op handling when no test specs are modified in the PR.
- [x] **US-AF-1013.4** (`DevOps Engineer`): Format GITHUB_STEP_SUMMARY on burn-in test results and failure links to `docs/quarantine_lifecycle_guide.md`.

### US-AF-1014: Mock-Driven Edge-State UI Suite (1 SP) — `Test_001_MockedEdgeStates.spec.ts`

- [x] **US-AF-1014.1** (`Playwright QA Lead`): Create HAR recorded fixtures and redaction helper/script (`npm run har:record` in `playwright-e2e`).
- [x] **US-AF-1014.2** (`Playwright QA Lead`): Author `src/tests/ui/EdgeStates/Test_001_MockedEdgeStates.spec.ts` covering:
  - Empty catalog (`GET /api/books` -> `[]`) displaying empty state UI.
  - Checkout 500 error (`POST /api/checkout/process` -> 500) displaying user error banner without crash and retryable.
  - Slow inventory response (delayed route fulfillment) showing loading spinner then content.
  - Offline mode (`context.setOffline(true)`) validating offline resilience/notification.
- [x] **US-AF-1014.3** (`SDET Architect`): Register `UI-EDGE-*` test cases in both `docs/test_cases_catalog.md` and `playwright-e2e/test_cases_catalog.md` in 100% lockstep parity.
- [x] **US-AF-1014.4** (`SDET Architect`): Verify catalog sync with `npm run test:verify-catalog`.

### US-AF-1015: Review, DoD Audit & Release Lifecycle

- [x] **US-AF-1015.1** (`SDET Architect`): Conduct Code Acceptance Review against Sprint 10.1 Code Review Checklist.
- [x] **US-AF-1015.2** (`Scrum Master`): Validate Definition of Done (DoD) criteria and sign off sprint.
- [x] **US-AF-1015.3** (`DevOps Engineer`): Commit changes, push branch `feat/sprint-10.1-ui-determinism`, open PR with `gh pr create`, monitor CI checks.

---

## 3. Sprint Review Comments & Refinement Loop

| Gate / Reviewer                  | Target Role     | Review Feedback & Comments                                                         | Gate Status |
| :------------------------------- | :-------------- | :--------------------------------------------------------------------------------- | :---------: |
| **Pre-Flight Architecture Gate** | SDET Architect  | Strategy verification, ESLint rule plan, edge-state mock design, and dual-catalog. | `[PASSED]`  |
| **Code Acceptance Review Gate**  | SDET Architect  | Zero hard waits confirmed; ESLint static analysis clean; HAR fixture sanitized.    | `[PASSED]`  |
| **Scrum Master DoD Gate**        | Scrum Master    | 4-point DoD audited: lint/typecheck 0 exit, all tests pass, catalog parity synced. | `[PASSED]`  |
| **DevOps Release Gate**          | DevOps Engineer | Workflow burn-in job verified, PR prepared, clean commit history ready.            | `[PASSED]`  |
| **Final Human Sign-Off**         | Human Tech Lead | Final PR review and merge to `main`.                                               | `[STANDBY]` |

---

## 4. Definition of Done (DoD) Checklist

- [x] `npm run lint:all` and `npm run typecheck:all` pass across all workspaces with 0 errors.
- [x] 0 hard waits in `playwright-e2e/src/tests` (`setTimeout(r`, `waitForTimeout`); banned by ESLint at `error`.
- [x] New ESLint rules active across Playwright, Selenium, and WDIO configs.
- [x] `burn-in` job configured in `.github/workflows/pr-gate.yml` (`--only-changed`, `--repeat-each=5`, `--retries=0`).
- [x] `Test_001_MockedEdgeStates.spec.ts` authored with 4 mock edge-case scenarios + HAR fixtures sanitized.
- [x] Dual-catalog parity confirmed: `npm run test:verify-catalog` exits 0 (819 lines, 301 tests, 0 diff).
- [x] Single-browser execution policy strictly preserved (Google Chrome UI + API only).
- [x] Sprint documentation updated (`sprint_10_1_ui_determinism_and_lint_enforcement.md`, `planning/README.md`, `planning/Phases/phase_10_*.md`).
- [x] Pull request opened with structured summary and verification evidence (`gh pr create`).
- [x] All CI workflow checks green.

---

## 5. Verification & Execution Evidence

```bash
# 1. Zero hard waits verification:
git grep -E "setTimeout\(r|waitForTimeout" playwright-e2e/src/tests
# Output: Clean (0 matches)

# 2. Dual-catalog verification:
npm run test:verify-catalog
# Output: [PASS] Catalogs are in sync! Docs: 819 lines, Playwright: 819 lines, Unique tests: 301.

# 3. Static analysis:
npm run lint:all
# Output: Clean across all 6 workspaces (0 errors, 38 warnings).
npm run typecheck:all
# Output: 0 TypeScript errors across monorepo.

# 4. Modified & new test execution (29 tests across 7 files):
cd playwright-e2e
npx playwright test src/tests/ui/A11y/Test_007_A11yScanValidation.spec.ts src/tests/ui/Refresh/Test_006_JwtRefreshValidation.spec.ts src/tests/api/UserManagement/Test_002_TokenRefreshAndProfileApi.spec.ts src/tests/ui/VisualRegression/Test_010_VisualRegressionChaos.spec.ts src/tests/api/Realtime/Test_001_SocketIoApi.spec.ts src/tests/ui/EdgeStates/Test_001_MockedEdgeStates.spec.ts
# Output: 29 passed (100% green, 0 flakiness, 0 retries, 1m 10s duration)

# 5. Pull Request & CI Verification:
# PR: https://github.com/munna7862/automation-frameworks/pull/50
# Checks: 15/15 passed (100% green)
#   - Actionlint Workflow Linter: pass
#   - CodeQL & CodeQL Analysis: pass
#   - Conventional Commits: pass
#   - Dependency Review: pass
#   - Flake Burn-In (Changed Specs 5x): pass (4m 15s)
#   - Gitleaks Secret Detection: pass
#   - License Compliance, Audit & SBOM: pass
#   - OSV Vulnerability Scanner: pass
#   - Smoke Tests (Chrome UI + API): pass (2m 39s)
#   - Static Quality & Linting: pass (1m 2s)
#   - ZAP Baseline Passive Scan (PR): pass (2m 12s)
#   - Zizmor Workflow Security Audit: pass
```
