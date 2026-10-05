# Task Backlog: AutomationFrameworks Sprint Execution

## Current Focus: Sprint 6.1 — Trustworthy Pipelines Hot-Fix

**Sprint Identifier**: `SPRINT-6.1-TRUSTWORTHY-PIPELINES-HOTFIX`  
**Phase**: Phase 6 (CI/CD Integrity & Supply-Chain Security)  
**Story Points**: 4 SP  
**Branch**: `fix/sprint-6.1-trustworthy-pipelines`  
**Goal**: Make every CI signal trustworthy: failing tests fail the build, summaries report real results, no credentials in YAML, no secrets in logs, and API helpers stop swallowing errors.

---

## 1. Persona Roles & Ownership Matrix

| Persona | Role Assignment | Responsibilities for this Sprint | Status |
| :--- | :--- | :--- | :--- |
| **Scrum Master** | `role-scrum-master` | Sprint kick-off, `task.md` tracking, DoR verification, and DoD audit. | `COMPLETED` |
| **SDET Architect** | `role-sdet-architect` | Redaction rules design, code acceptance review, verifying test semantics, dual-catalog check. | `COMPLETED` |
| **Playwright QA Lead** | `role-playwright-automation` | `redact()` integration, `ApiError` refactor, migrating `Test_007`, security unit tests. | `COMPLETED` |
| **DevOps Engineer** | `role-devops-engineer` | Workflow outcome gating, honest step summaries (`summarize-test-results.js`), secret cleanup, concurrency groups, PR release. | `COMPLETED` |
| **Product Owner** | Human Tech Lead (`User`) | Backlog prioritization, sprint kickoff, and final PR review & merge. | `STANDBY` |

---

## 2. Granular Task Breakdown

### US-AF-611: Fail the Build When Tests Fail & Dynamic Test Summaries (1.5 SP)
- [x] **US-AF-611.1** (`DevOps Engineer`): Assign `id: tests` and keep `continue-on-error: true` only to allow reporting in `playwright-ci.yml`, `selenium-ci.yml`, `wdio-ci.yml`, and `mobile-ci.yml`.
- [x] **US-AF-611.2** (`DevOps Engineer`): Add a terminal job-gating step (`if: always() && steps.tests.outcome == 'failure' run: exit 1`) in all 4 test workflows to fail the run on test failures.
- [x] **US-AF-611.3** (`DevOps Engineer`): Ensure downstream `deploy-report` jobs run with `if: always()` and `needs: [test]` so Allure reports publish even when tests fail.
- [x] **US-AF-611.4** (`DevOps Engineer`): Author `scripts/summarize-test-results.js` to auto-detect Playwright `results.json` or Allure `widgets/summary.json`, format markdown summary tables with failure breakdown, and output to `$GITHUB_STEP_SUMMARY`.
- [x] **US-AF-611.5** (`DevOps Engineer`): Wire `scripts/summarize-test-results.js` into the 4 test workflows and `pr-gate.yml`.

### US-AF-612: Honest PR Gate, No Credential Fallbacks & Strict Installs (1 SP)
- [x] **US-AF-612.1** (`DevOps Engineer`): Refactor `pr-gate.yml` static summary into a dynamic summary evaluating `${{ steps.<id>.outcome }}` for lint, typecheck, catalog, and calling `summarize-test-results.js` for smoke tests.
- [x] **US-AF-612.2** (`DevOps Engineer`): Remove credential fallback literals (`|| 'admin'`, `|| 'password123'`) from `playwright-on-demand.yml` and add a fail-fast secret validation step.
- [x] **US-AF-612.3** (`DevOps Engineer`): Replace all occurrences of `npm ci || npm install` with strict `npm ci` across all GitHub workflows.
- [x] **US-AF-612.4** (`DevOps Engineer`): Configure staging state concurrency group (`concurrency: { group: buggybooks-staging-state, cancel-in-progress: false }`) on test jobs in workflows mutating chaos/reset state.

### US-AF-613: Central Secret Redaction (1 SP)
- [x] **US-AF-613.1** (`Playwright QA Lead` / `SDET Architect`): Implement `packages/playwright-utils/src/security/redact.ts` exporting sensitive keys, `redactHeaders`, `redactBody`, and `redactString`.
- [x] **US-AF-613.2** (`SDET Architect`): Export security redaction utilities from `packages/playwright-utils/src/index.ts`.
- [x] **US-AF-613.3** (`Playwright QA Lead`): Integrate redaction into `ApiUtil.makeRequest`, `getBearerToken`, `NetworkInterceptor` (Playwright & WDIO), and `CommonFunctions.logMessage`.
- [x] **US-AF-613.4** (`Playwright QA Lead`): Create unit tests in `packages/playwright-utils/src/security/redact.test.ts` executed via `tsx --test`, and add `"test"` script in `packages/playwright-utils/package.json`.

### US-AF-614: `ApiUtil` Error Semantics & Test_007 Migration (0.5 SP)
- [x] **US-AF-614.1** (`SDET Architect` / `Playwright QA Lead`): Author `ApiError` class with HTTP status, data, headers, URL, and method.
- [x] **US-AF-614.2** (`Playwright QA Lead`): Refactor `ApiUtil.makeRequest` to throw `ApiError` on non-2xx status and network errors by default, supporting `throwOnError: boolean = true`.
- [x] **US-AF-614.3** (`Playwright QA Lead`): Migrate `src/tests/ui/Checkout/Test_007_ConcurrentStockRaceCondition.spec.ts` to `throwOnError: false` for expected stock collision requests and assert status directly.
- [x] **US-AF-614.4** (`Playwright QA Lead`): Verify zero occurrences of `{ success: false }` swallowing in `playwright-e2e/src/utils/api.util.ts`.

### Verification, DoD & Release Protocol
- [x] **US-AF-610.1** (`Scrum Master`): Verify Pre-Flight Definition of Ready (DoR) with Render warm-up probe.
- [x] **US-AF-610.2** (`SDET Architect`): Review code acceptance checklist against Sprint 6.1 specifications.
- [x] **US-AF-610.3** (`Scrum Master`): Perform 4-point Definition of Done (DoD) audit.
- [x] **US-AF-610.4** (`DevOps Engineer`): Commit, push branch, open PR with full verification evidence, monitor CI checks.

---

## 3. Sprint Review Comments & Refinement Loop

| Gate / Reviewer | Target Role | Review Feedback & Comments | Gate Status |
| :--- | :--- | :--- | :---: |
| **Pre-Flight Architecture Gate** | SDET Architect | Staging pre-flight probe and DoR audit. Verified online. | `[PASSED]` |
| **Code Acceptance Review Gate** | SDET Architect | Verify outcome gating, redaction immutability, `ApiError` semantics, and `Test_007` migration. | `[PASSED]` |
| **Scrum Master DoD Gate** | Scrum Master | Audit lint, typecheck, catalog sync, and zero test regression. | `[PASSED]` |
| **DevOps Release Gate** | DevOps Engineer | PR created with complete evidence; CI checks passing. | `[PASSED]` |
| **Final Human Sign-Off** | Human Tech Lead | Final PR review and merge to `main`. | `[READY]` |

---

## 4. Definition of Done (DoD) Checklist

- [x] All 4 user stories' acceptance criteria met.
- [x] `npm run lint:all`, `npm run typecheck:all`, `npm run test:verify-catalog` exit 0.
- [x] Security redaction unit tests pass (`npx tsx --test packages/playwright-utils/src/security/redact.test.ts`).
- [x] `Test_007_ConcurrentStockRaceCondition.spec.ts` passes 5/5 with `--repeat-each=5`.
- [x] `grep -rnE "password123|\|\| 'admin'|npm ci \|\|" .github/` returns 0 matches.
- [x] `grep -rn "success: false" playwright-e2e/src/utils` returns 0 matches.
- [x] `AGENTS.md` updated with guidance on test step outcome gating.
- [x] `planning/Sprints/sprint_6_1_trustworthy_pipelines_hotfix.md` and planning hub updated.
- [x] Pull request opened with structured summary and verification evidence (`gh pr create`).
- [x] All CI workflow checks green.

---

## 5. Verification & Execution Evidence

```bash
# 1. Strict Installs & Linters
npm ci
npm run lint:all && npm run typecheck:all
npm run test:verify-catalog

# 2. Redaction Unit Tests
npx tsx --test packages/playwright-utils/src/security/redact.test.ts

# 3. Test_007 Deterministic Execution
cd playwright-e2e && npx playwright test src/tests/ui/Checkout/Test_007_ConcurrentStockRaceCondition.spec.ts --config=src/config/playwright.config.ts --repeat-each=5

# 4. Sanitation Verification
grep -rnE "password123|\|\| 'admin'|npm ci \|\|" ../.github/
grep -rn "success: false" src/utils
```
