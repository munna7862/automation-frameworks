# Sprint 10.1: UI Determinism & Lint Enforcement

**Navigation**: [⬅️ Previous: Sprint 9.2](sprint_9_2_appsec_security_test_suite.md) | [🗺️ Planning Hub](../README.md) | [Phase 10](../Phases/phase_10_ui_quality_web_vitals_and_framework_parity.md) | [Next: Sprint 10.2 ➡️](sprint_10_2_accessibility_web_vitals_and_visual_hardening.md)

**Sprint Identifier**: `SPRINT-10.1-UI-DETERMINISM-AND-LINT`
**Phase Mapping**: [Phase 10](../Phases/phase_10_ui_quality_web_vitals_and_framework_parity.md)
**Estimated Velocity**: 4 Story Points
**Sprint Status**: Not Started
**Branch**: `feat/sprint-10.1-ui-determinism`
**Depends On**: Sprint 7.1 (DOCKER env for stable repeats)
**Sprint Goal**: Eliminate hard waits, enforce deterministic patterns through ESLint, catch new flaky tests before merge with burn-in, and add mock-driven tests for hard-to-reach UI states.

---

## 1. Context & Evidence (hard waits at main@1de55ad)

| File | Line | Code |
| :--- | :--- | :--- |
| `src/tests/ui/A11y/Test_007_A11yScanValidation.spec.ts` | 20, 35 | `await new Promise(r => setTimeout(r, 400));` |
| `src/tests/ui/Refresh/Test_006_JwtRefreshValidation.spec.ts` | 28 | `setTimeout(r, 3000)` |
| `src/tests/ui/VisualRegression/Test_010_VisualRegressionChaos.spec.ts` | 19, 208 | `setTimeout(r, 300)`, `setTimeout(r, 3500)` |
| `src/tests/api/UserManagement/Test_002_TokenRefreshAndProfileApi.spec.ts` | 40 | `setTimeout(r, 3000)` |

---

## 2. Persona Roles & Ownership Matrix

| Persona | Responsibilities |
| :--- | :--- |
| **Playwright QA Lead** | Replace waits, mocks suite, locator audit |
| **DevOps Engineer** | Burn-in job in PR gate |
| **SDET Architect** | ESLint rule set, review |

---

## 3. Sprint Backlog & User Stories

### US-AF-1011: Remove hard waits (1 SP)
- [ ] A11y: wait for the actual condition (e.g. `await expect(page.getByRole('main')).toBeVisible()` plus animations finished via `page.waitForFunction(() => document.getAnimations().every(a => a.playState !== 'running'))`).
- [ ] JWT refresh (UI and API): the test waits for token expiry. Use a **short-lived token** via a test-control knob if one exists, otherwise `expect.poll(() => api.auth.me(token).then(r => r.status), { timeout: 10_000 }).toBe(401)`, or use Playwright's `page.clock` to fast-forward client-side timers where the expiry is checked client-side.
- [ ] Visual chaos: replace sleeps with "layout stable" polling (bounding boxes unchanged across 2 consecutive frames) or `toHaveScreenshot`'s built-in retry with `animations: 'disabled'`.

### US-AF-1012: ESLint enforcement (1 SP)
In `playwright-e2e/eslint.config.mjs`:
- [ ] `playwright/no-wait-for-timeout: error`, `playwright/no-force-option: error`, `playwright/prefer-web-first-assertions: error`, `playwright/no-conditional-in-test: warn`, `playwright/no-networkidle: error`, `playwright/no-element-handle: error`, `playwright/no-page-pause: error`, `playwright/no-focused-test: error`.
- [ ] `no-restricted-syntax` for `src/tests/**`: ban `setTimeout` inside `new Promise` (message: "Use expect.poll / web-first assertions").
- [ ] `no-restricted-syntax` / `no-restricted-properties` for `src/tests/**`: ban `page.locator(` with raw CSS/XPath strings (locators belong in `src/pages/**`). Start at `warn`, list the offenders, migrate them, then switch to `error`.
- [ ] Mirror the hard-wait ban in Selenium (`driver.sleep`) and WDIO (`browser.pause`) ESLint configs from Sprint 6.4.

### US-AF-1013: PR burn-in for changed specs (1 SP)
- [ ] New job `burn-in` in `pr-gate.yml` (after smoke, DOCKER env):
  ```bash
  npx playwright test --config=src/config/playwright.config.ts \
    --only-changed=origin/main --repeat-each=5 --retries=0 --workers=4
  ```
  (`--only-changed` needs Playwright ≥ 1.46 — we're on 1.58; checkout with `fetch-depth: 0`.)
- [ ] When no specs changed, the job no-ops successfully.
- [ ] On failure, the Step Summary lists the flaky test titles with a link to the quarantine guide.

### US-AF-1014: Mock-driven edge-state UI suite (1 SP)
- [ ] `src/tests/ui/EdgeStates/Test_001_MockedEdgeStates.spec.ts` using `page.route` (and `page.routeFromHAR` for a recorded happy path):
  - Empty catalog (`GET /api/books → []`) → empty-state message.
  - Checkout 500 → user-facing error, no crash, retry possible.
  - Inventory/report slow (route with delayed `fulfill`) → loading indicator, then content.
  - Offline (`context.setOffline(true)`) → offline UX.
- [ ] HARs stored in `src/test-data/ui/har/` with a `npm run har:record` script; secrets redacted (Sprint 6.1 `redact`) before saving.
- [ ] Catalog entries `UI-EDGE-*`.

---

## 4. Verification Commands

```bash
cd playwright-e2e
npm run lint
grep -rnE "setTimeout\(r|waitForTimeout" src/tests || echo "no hard waits"
ENV=DOCKER npx playwright test --config=src/config/playwright.config.ts --project=chrome --repeat-each=5 --retries=0 \
  src/tests/ui/A11y src/tests/ui/Refresh src/tests/ui/VisualRegression src/tests/ui/EdgeStates
```

---

## 5. Code Review Checklist

- [ ] Each replaced wait polls a **meaningful** condition (not a disguised sleep like `expect.poll(() => Date.now() > t)`).
- [ ] Test duration didn't grow (record before/after for the 4 touched files).
- [ ] ESLint rules apply only to the intended globs (POMs can still use `page.locator`).
- [ ] Burn-in uses `--retries=0`.
- [ ] HAR files contain no tokens or passwords.

---

## 6. Definition of Done

- [ ] 0 hard waits; lint rules at `error` (locator rule at least `warn` with a tracked follow-up).
- [ ] Touched specs pass 5/5 with `--retries=0` on DOCKER.
- [ ] Burn-in job live on PRs.
- [ ] Both catalogs updated for `UI-EDGE-*`.

---

## 7. Deliverables Summary

| Artifact | Description |
| :--- | :--- |
| Updated specs (6 hard-wait sites) | Deterministic waits |
| `playwright-e2e/eslint.config.mjs` (+ selenium/wdio configs) | Enforcement |
| `.github/workflows/pr-gate.yml` → `burn-in` job | Flake prevention |
| `src/tests/ui/EdgeStates/*`, `src/test-data/ui/har/*` | Mocked edge states |
