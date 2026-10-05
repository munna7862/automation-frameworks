# Sprint 10.3: Selenium & WebdriverIO Parity Expansion

**Navigation**: [⬅️ Previous: Sprint 10.2](sprint_10_2_accessibility_web_vitals_and_visual_hardening.md) | [🗺️ Planning Hub](../README.md) | [Phase 10](../Phases/phase_10_ui_quality_web_vitals_and_framework_parity.md) | [Next: Sprint 11.1 ➡️](sprint_11_1_k6_performance_maturity.md)

**Sprint Identifier**: `SPRINT-10.3-SELENIUM-WDIO-PARITY`
**Phase Mapping**: [Phase 10](../Phases/phase_10_ui_quality_web_vitals_and_framework_parity.md)
**Estimated Velocity**: 4 Story Points
**Sprint Status**: Not Started
**Branch**: `feat/sprint-10.3-framework-parity`
**Depends On**: Sprint 7.1 (DOCKER), Sprint 7.2 (seeders), Sprint 6.4 (lint for Selenium/WDIO)
**Sprint Goal**: Bring Selenium and WebdriverIO to a 12-test critical-journey parity set on Google Chrome, add parallelism and a Selenium Grid option, and refresh the comparison benchmark with like-for-like data.

---

## 1. Context & Evidence

| Framework | Specs | Tests | Parallelism |
| :--- | :---: | :---: | :--- |
| Playwright | 20 UI files | 54 | 4 workers in CI |
| Selenium (`selenium-e2e`) | 2 (`Test_001_Selenium_Auth`, `Test_002_Selenium_Catalog`) | 5 | Sequential Mocha |
| WDIO (`wdio-e2e`) | 2 (`Test_001_WDIO_AuthAndCatalog`, `Test_002_WDIO_CartAndCheckout`) | 5 | `maxInstances: 2` in CI |

`docs/architecture/framework_comparison_benchmark.md` compares 7 vs 5 vs 5 tests, so the numbers aren't like-for-like.

---

## 2. Parity Set (same scenarios in both frameworks)

| # | Parity ID | Scenario | Playwright reference |
| :-- | :--- | :--- | :--- |
| 1 | `PAR-01` | Register new user | `UserManagement/Test_001_RegisterUser` |
| 2 | `PAR-02` | Login existing user | `UserManagement/Test_002_LoginWithExistingUser` |
| 3 | `PAR-03` | Protected route redirects anonymous user | `UserManagement/Test_003_ProtectedRouteGuard` |
| 4 | `PAR-04` | Catalog loads with books | `BookCatalog/Test_001_InitialCatalog` |
| 5 | `PAR-05` | Search + open detail | `BookCatalog/Test_002_SearchAndDetailCatalog` |
| 6 | `PAR-06` | Add to cart | `Checkout/Test_003_CartAndCheckoutValidation` |
| 7 | `PAR-07` | Adjust quantity | `Checkout/Test_006_CartQuantityAdjustment` |
| 8 | `PAR-08` | Checkout wizard validation errors | `Checkout/Test_004_CheckoutWizardValidation` |
| 9 | `PAR-09` | Complete purchase + Shadow DOM order summary | `Checkout/Test_001_CompleteBookPurchase` |
| 10 | `PAR-10` | Order appears in history (seeded via API) | `Profile/Test_006_ProfileSummaryAndOrderHistory` |
| 11 | `PAR-11` | Logout clears session | (new in Playwright too, if missing) |
| 12 | `PAR-12` | Chaos resilience: checkout retry with `checkoutFailureRate` | `docs/intentional_bugs.md` §3.1 recipes |

---

## 3. Persona Roles & Ownership Matrix

| Persona | Responsibilities |
| :--- | :--- |
| **Selenium Specialist** | Selenium POMs and specs, Grid, parallel Mocha |
| **Selenium / WDIO QA** | WDIO POMs and specs, Allure steps |
| **SDET Architect** | Parity IDs, catalog traceability, benchmark refresh |
| **DevOps Engineer** | Grid service container, nightly wiring |

---

## 4. Sprint Backlog & User Stories

### US-AF-1031: Selenium parity + parallel + Grid (1.5 SP)
- [ ] Add POMs: `RegisterPage`, `BookDetailPage`, `CartPage`, `CheckoutPage` (Shadow DOM via `getShadowRoot()`), `ProfilePage`.
- [ ] Specs: `Test_003…Test_00N` covering PAR-01…12 (reuse the existing auth/catalog specs where they already match).
- [ ] `.mocharc.json`: `parallel: true`, `jobs: 4` (each test file gets its own driver, which `DriverFactory` already supports per suite — verify).
- [ ] `DriverFactory`: `SELENIUM_REMOTE_URL` → `Builder().usingServer(url)`; otherwise local ChromeDriver. Chrome options shared (headless new, window size 1280×720, `--disable-notifications`).
- [ ] CI: `services: selenium: image: selenium/standalone-chrome:<pinned>` with `shm-size: 2gb`, used when `SELENIUM_GRID=true` (nightly). This image ships Google Chrome.
- [ ] Seed state through `@automationframeworks/test-data` `ApiSeeder` (axios adapter) for PAR-10.

### US-AF-1032: WDIO parity + reporting (1.5 SP)
- [ ] Add POMs: `RegisterPage`, `BookDetailPage`, `ProfilePage` (Cart/Checkout/Login/Catalog exist).
- [ ] Specs covering PAR-01…12.
- [ ] `@wdio/allure-reporter` steps (`addStep` / `step`) in POM actions; network interceptor output (redacted) attached on failure.
- [ ] `maxInstances: 4` in CI; consistent `browserName: 'chrome'` + `goog:chromeOptions`.

### US-AF-1033: Traceability & benchmark refresh (1 SP)
- [ ] Catalogs: add a `Parity ID` column, or put a `PAR-xx` tag in `Tags`, for the Playwright, Selenium and WDIO rows; the `Covered` column lists the spec path per framework.
- [ ] `scripts/parity-report.ts`: reads all three frameworks' results (Playwright JSON, Mocha/WDIO Allure results) and prints a PAR-01…12 × framework matrix (✅/❌/➖) to the Step Summary in the nightly run.
- [ ] Re-run the benchmark (3 runs each, DOCKER, same runner type) and rewrite §2 of `docs/architecture/framework_comparison_benchmark.md` with like-for-like numbers (wall time, mean per test, setup overhead, LOC per scenario).

---

## 5. Verification Commands

```bash
docker compose -f infra/docker-compose.test.yml up -d --wait
cd selenium-e2e && ENV=DOCKER npm test && npm run lint && npm run typecheck
cd ../wdio-e2e && ENV=DOCKER npm test && npm run lint && npm run typecheck
docker run -d --rm --network host --shm-size=2g selenium/standalone-chrome:latest
cd ../selenium-e2e && ENV=DOCKER SELENIUM_REMOTE_URL=http://localhost:4444/wd/hub npm test
npx tsx ../scripts/parity-report.ts
```

---

## 6. Code Review Checklist

- [ ] No `driver.sleep` / `browser.pause`; explicit waits only.
- [ ] Locators live in POMs; specs read like the Playwright equivalents (same Arrange/Act/Assert steps).
- [ ] Each framework uses **Google Chrome** (Grid image = standalone-chrome).
- [ ] Parallel Mocha: no shared mutable state between files (driver per file, unique users per test).
- [ ] Chaos specs reset in `afterEach`.
- [ ] Benchmark numbers are reproducible (method documented: runner, env, 3-run median).

---

## 7. Definition of Done

- [ ] Selenium ≥ 12 tests and WDIO ≥ 12 tests green 3× on DOCKER.
- [ ] Parity matrix shows PAR-01…12 ✅ in all three frameworks (or documented ➖ with a reason).
- [ ] Catalogs updated in lockstep; benchmark doc refreshed.

---

## 8. Deliverables Summary

| Artifact | Description |
| :--- | :--- |
| `selenium-e2e/src/pages/*`, `src/tests/ui/Test_003…` | Selenium parity |
| `selenium-e2e/src/core/driver.factory.ts`, `.mocharc.json` | Grid + parallel |
| `wdio-e2e/src/pages/*`, `src/tests/ui/Test_003…` | WDIO parity |
| `scripts/parity-report.ts` | Cross-framework matrix |
| `docs/architecture/framework_comparison_benchmark.md` | Refreshed benchmark |
