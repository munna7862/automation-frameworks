# Sprint 6.1: Trustworthy Pipelines Hot-Fix

**Navigation**: [⬅️ Previous: Sprint 5.3](sprint_5_3_automated_monorepo_health_auditing_and_closed_loop_governance.md) | [🗺️ Planning Hub](../README.md) | [Phase 6](../Phases/phase_6_cicd_integrity_and_supply_chain_security.md) | [Next: Sprint 6.2 ➡️](sprint_6_2_reusable_workflows_and_composite_actions.md)

**Sprint Identifier**: `SPRINT-6.1-TRUSTWORTHY-PIPELINES-HOTFIX`
**Phase Mapping**: [Phase 6: CI/CD Integrity & Supply-Chain Security](../Phases/phase_6_cicd_integrity_and_supply_chain_security.md)
**Estimated Velocity**: 4 Story Points
**Sprint Status**: Not Started
**Branch**: `fix/sprint-6.1-trustworthy-pipelines`
**Depends On**: None (start here)
**Sprint Goal**: Make every CI signal trustworthy: failing tests fail the build, summaries report real results, no credentials in YAML, no secrets in logs, and API helpers stop swallowing errors.

---

## 1. Context & Evidence

| # | Defect | Location |
| :-- | :--- | :--- |
| F1 | Test step has `continue-on-error: true`; nothing fails the job later | `.github/workflows/playwright-ci.yml` (step "Run tests"), `selenium-ci.yml` ("Run Selenium Tests"), `wdio-ci.yml` ("Run WebdriverIO Tests"), `mobile-ci.yml` (Appium step) |
| F2 | Hard-coded summary text | `.github/workflows/pr-gate.yml` → "Generate Static Quality Summary" |
| F3 | `secrets.E2E_USER_NAME \|\| 'admin'`, `secrets.E2E_PASSWORD \|\| 'password123'` | `.github/workflows/playwright-on-demand.yml` (api-tests and ui-tests jobs) |
| F4 | Full payloads logged; no masking | `playwright-e2e/src/utils/api.util.ts`, `playwright-e2e/src/core/network/network.interceptor.ts`, `wdio-e2e/src/core/network/network.interceptor.ts` |
| F5 | `makeRequest` catches every error and returns `{ success:false, … } as T` | `playwright-e2e/src/utils/api.util.ts` |
| F6 | Concurrent workflows mutate shared staging chaos state | All workflows that call `/api/test/config` or `/api/test/reset` |
| F8 | `npm ci \|\| npm install` hides lockfile drift | `pr-gate.yml`, `k6-performance.yaml`, `mobile-ci.yml`, `selenium-ci.yml`, `wdio-ci.yml` |

---

## 2. Persona Roles & Ownership Matrix

| Persona | Responsibilities for this Sprint |
| :--- | :--- |
| **DevOps Engineer** | Workflow fixes (F1, F2, F3, F6, F8), outcome-gating script |
| **Playwright QA Lead** | `redact()` integration, `ApiError` refactor, migrating `Test_007` |
| **SDET Architect** | Redaction rules design, code acceptance review, verifying no test semantics changed |
| **Scrum Master** | DoD audit, `task.md` tracking |

---

## 3. Sprint Backlog & User Stories

### US-AF-611: Fail the build when tests fail (1.5 SP)
- **Story**: *As a* PO, *I want* any failing test to turn its workflow red, *so that* green badges mean green tests.
- **Subtasks**:
  - [ ] Give every test-execution step an `id: tests` and keep `continue-on-error: true` **only** so that report steps still run.
  - [ ] Add a final step to each of the 4 workflows:
    ```yaml
    - name: Fail job if tests failed
      if: always() && steps.tests.outcome == 'failure'
      run: |
        echo "::error::Test execution failed — see Allure/Monocart report"
        exit 1
    ```
  - [ ] Make sure the `deploy-report` job still runs (`if: always()` with `needs: test`) so reports publish for failed runs.
  - [ ] Author `scripts/summarize-test-results.js`:
    - Input: path to Playwright `results.json` **or** an Allure `widgets/summary.json` (auto-detected).
    - Output: a Markdown table (Total / Passed / Failed / Flaky / Skipped / Duration) appended to `$GITHUB_STEP_SUMMARY`, plus the first 10 failing test titles.
    - Exit code 0 always (the gate step above owns failure).
  - [ ] Call the script from the 4 workflows plus `pr-gate.yml`.
- **Acceptance Criteria**:
  - On a throwaway branch, a deliberately failing assertion (`expect(1).toBe(2)`) makes each workflow conclude **failure**.
  - The Allure report for that run is still published to gh-pages.
  - The Step Summary shows correct counts.

### US-AF-612: Honest PR gate, no credential fallbacks, strict installs (1 SP)
- **Subtasks**:
  - [ ] `pr-gate.yml`: replace the static summary with one that reads `${{ steps.<id>.outcome }}` for lint, typecheck and catalog, and calls `summarize-test-results.js` for smoke.
  - [ ] `playwright-on-demand.yml`: remove the `|| 'admin'` and `|| 'password123'` fallbacks. Add a "Validate required secrets" step that fails with `::error::E2E_USER_NAME secret is not configured` when it's empty.
  - [ ] Replace every `npm ci || npm install` with `npm ci`.
  - [ ] Add a workflow-level `concurrency: { group: buggybooks-staging-state, cancel-in-progress: false }` to the **test jobs** of workflows that mutate chaos/reset state (pr-gate smoke, playwright-ci, playwright-on-demand, mobile-ci, quarantine-audit). Leave Pages deploy on its own existing group.
- **Acceptance Criteria**:
  - `grep -rnE "password123|\|\| 'admin'" .github/` → no matches.
  - `grep -rn "npm ci ||" .github/` → no matches.
  - The PR gate summary shows ❌ when lint fails (verify on a throwaway branch).

### US-AF-613: Central secret redaction (1 SP)
- **Subtasks**:
  - [ ] Add `packages/playwright-utils/src/security/redact.ts` exporting:
    ```ts
    export const SENSITIVE_HEADER_KEYS: string[];   // authorization, cookie, set-cookie, x-api-key, x-csrf-token
    export const SENSITIVE_BODY_KEYS: string[];     // password, newPassword, token, accessToken, refreshToken, cardNumber, cvv, secret
    export function redactHeaders(h: Record<string, string>): Record<string, string>;
    export function redactBody(body: unknown): unknown;          // deep, case-insensitive, handles JSON strings + URLSearchParams
    export function redactString(s: string): string;             // masks "Bearer xxx" + JWT-shaped tokens (eyJ…\.…\.…)
    ```
  - [ ] Export from `packages/playwright-utils/src/index.ts`.
  - [ ] Apply in: `ApiUtil.makeRequest` logging, `getBearerToken` (it currently logs `client_secret`), both `NetworkInterceptor` classes (`headers`, `postData`, response `body`), and `CommonFunctions.logMessage` (final safety net via `redactString`).
  - [ ] Unit tests with `node:test` (`packages/playwright-utils/src/security/redact.test.ts`, run via `tsx --test`); add a `test` script to the package. Cover nested objects, arrays, JSON strings, case-insensitive keys, JWT in free text, and inputs that aren't objects.
- **Acceptance Criteria**:
  - Unit tests pass.
  - Running `Test_001_RegisterAndLoginUser.spec.ts` locally and opening `network-log.json` shows no raw password or JWT.

### US-AF-614: `ApiUtil` error semantics (0.5 SP)
- **Subtasks**:
  - [ ] Introduce `class ApiError extends Error { status; data; headers; url; method }`.
  - [ ] `makeRequest` **throws** `ApiError` on non-2xx or network errors by default. New option `throwOnError?: boolean` (default `true`); when `false`, return the full axios response (including error status) **without** faking `success`.
  - [ ] Migrate `src/tests/ui/Checkout/Test_007_ConcurrentStockRaceCondition.spec.ts` (the only consumer) to use `throwOnError: false` where a failing request is the expected outcome; assert on `status` explicitly.
- **Acceptance Criteria**:
  - `Test_007` passes 5/5 with `--repeat-each=5`.
  - `grep -rn "success: false" playwright-e2e/src/utils` → no matches.

---

## 4. Verification Commands

```bash
npm ci
npm run lint:all && npm run typecheck:all
npx tsx --test packages/playwright-utils/src/security/redact.test.ts
cd playwright-e2e && npx playwright test src/tests/ui/Checkout/Test_007_ConcurrentStockRaceCondition.spec.ts --config=src/config/playwright.config.ts --repeat-each=5
grep -rnE "password123|\|\| 'admin'|npm ci \|\|" ../.github/ || echo "clean"
```
Plus a **throwaway PR** with one failing assertion → screenshot or link of the red run kept as evidence in the PR description (then close the throwaway PR).

---

## 5. Code Review Checklist (review gate)

- [ ] Each test workflow: `id` on the test step, gate step at the end with `if: always() && steps.<id>.outcome == 'failure'`.
- [ ] No other `continue-on-error` added to steps that should block.
- [ ] `redact()` is deep and case-insensitive, never mutates its input, and handles circular references safely (or documents that it can't).
- [ ] Redaction is applied **before** the data reaches Winston, the Allure `attach` call, or the file write.
- [ ] `ApiError` carries status, url and method for debuggability; the message itself has no secrets.
- [ ] No behaviour change in specs other than `Test_007`.
- [ ] Concurrency group names are consistent and documented in `docs/architecture/reporting_architecture.md` (or a new CI section).

---

## 6. Definition of Done

- [ ] All 4 user stories' acceptance criteria met.
- [ ] `npm run lint:all`, `npm run typecheck:all`, `npm run test:verify-catalog` exit 0.
- [ ] Full Playwright suite run once with fail-fast on; any real failures either fixed or quarantined with an issue link.
- [ ] `AGENTS.md` §2 or §6 gets a short note: "test steps must be gated; never rely on `continue-on-error` alone".
- [ ] PR opened with 📌 Summary and 🧪 Verification (include the red throwaway-run link).

---

## 7. Deliverables Summary

| Artifact | Type | Description |
| :--- | :--- | :--- |
| `.github/workflows/{playwright-ci,selenium-ci,wdio-ci,mobile-ci,pr-gate,playwright-on-demand}.yml` | Workflow | Outcome gating, honest summaries, no fallbacks, strict `npm ci`, staging concurrency |
| `scripts/summarize-test-results.js` | Script | Real Step Summary generator |
| `packages/playwright-utils/src/security/redact.ts` (+ test) | Library | Central redaction |
| `playwright-e2e/src/utils/api.util.ts` | Library | `ApiError`, `throwOnError` |
| `playwright-e2e/src/core/network/network.interceptor.ts`, `wdio-e2e/src/core/network/network.interceptor.ts` | Library | Redacted capture |
