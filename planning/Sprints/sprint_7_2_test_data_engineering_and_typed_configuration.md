# Sprint 7.2: Test Data Engineering & Typed Configuration

**Navigation**: [⬅️ Previous: Sprint 7.1](sprint_7_1_ephemeral_buggybooks_environment_in_ci.md) | [🗺️ Planning Hub](../README.md) | [Phase 7](../Phases/phase_7_hermetic_environments_test_data_and_developer_experience.md) | [Next: Sprint 7.3 ➡️](sprint_7_3_dev_container_and_local_developer_experience.md)

**Sprint Identifier**: `SPRINT-7.2-TEST-DATA-ENGINEERING`
**Phase Mapping**: [Phase 7](../Phases/phase_7_hermetic_environments_test_data_and_developer_experience.md)
**Estimated Velocity**: 4 Story Points
**Sprint Status**: Not Started
**Branch**: `feat/sprint-7.2-test-data`
**Depends On**: Sprint 7.1
**Sprint Goal**: Introduce a shared test-data package (factories, builders, API seeders, cleanup registry) and zod-validated typed configuration, so tests create exactly the state they need through the API and clean it up.

---

## 1. Context & Evidence

- Unique-user helpers are reimplemented per spec (e.g. `uniqueUsername()` in `Test_002_OrdersApi.spec.ts`); passwords such as `'Password123!'` are inlined.
- UI specs often build state by clicking through the UI before reaching the behaviour under test (slow, and fragile in places that aren't under test).
- `env.config.ts` reads strings with defaults; a missing value surfaces as a confusing runtime failure.
- Selenium, WDIO and k6 each have their own ad-hoc data.

---

## 2. Persona Roles & Ownership Matrix

| Persona | Responsibilities |
| :--- | :--- |
| **SDET Architect** | Package API design (builders, seeders, registry contracts) |
| **Playwright QA Lead** | Fixture integration; migrate reference specs |
| **Selenium / WDIO Specialist** | Consume seeders for setup in one spec each |
| **Performance Engineer** | Generate the k6/JMeter CSV datasets from the same factories |

---

## 3. Sprint Backlog & User Stories

### US-AF-721: `@automationframeworks/test-data` package (1.5 SP)
- [ ] New workspace `packages/test-data` (TypeScript, built to `dist`, added to root `workspaces`).
- [ ] Dependency: `@faker-js/faker` with a **seedable** instance (`TEST_DATA_SEED` env → reproducible failures; the seed is printed in reports).
- [ ] Factories and builders:
  ```ts
  UserFactory.build(overrides?)          // { username, password, fullName } — unique, policy-compliant password
  CheckoutDetailsFactory.build()          // uses test card numbers only
  new UserBuilder().withFullName('…').withCart([{ bookId: '1', qty: 2 }]).build()
  ```
- [ ] Shared constants: `TEST_CARD_NUMBERS`, `KNOWN_BOOK_IDS`, and `INVALID_INPUTS` (unicode, oversize, injection strings — reused by Phase 8/9).

### US-AF-722: API seeders & cleanup registry (1.5 SP)
- [ ] `packages/test-data/src/seed/ApiSeeder.ts` — HTTP-client agnostic (accepts a minimal `HttpLike` interface so it works with Playwright `APIRequestContext`, axios in Selenium/WDIO, etc.):
  - `createUser()`, `login(user)`, `addToCart(token, items)`, `placeOrder(token, details)`, `setStock(bookId, n)`.
- [ ] `CleanupRegistry`: `register(fn)` → executes in LIFO order at teardown, logs failures but doesn't throw (and reports them as warnings in Allure).
- [ ] Playwright fixtures in `playwright-e2e/src/core/base/data.fixture.ts`: `seed` (ApiSeeder bound to the session-isolated `request`) and `cleanup` (auto teardown). Merge into `base.fixture.ts` / `api.fixture.ts` via `mergeTests`.
- [ ] Migrate **5 reference specs**: `Test_002_OrdersApi`, `Test_001_CartAndInventoryApi`, `Test_006_ProfileSummaryAndOrderHistory` (UI: seed the order through the API, assert in the UI), `Test_006_CartQuantityAdjustment`, and one Selenium spec.

### US-AF-723: Typed, validated configuration (0.5 SP)
- [ ] `zod` schema for each framework's `env.config.ts` (`ENV` enum `DOCKER|STAGING|INTEROP`, URLs validated with `.url()`, booleans coerced, credentials required only when `ENV=STAGING`).
- [ ] On validation failure: one readable error listing every missing or invalid key, and exit before any test starts.

### US-AF-724: Perf datasets from the same source (0.5 SP)
- [ ] `packages/test-data/scripts/generate-perf-datasets.ts` → writes `jmeter/TestData/users.csv` and `k6-performance/data/users.json` (N users, seeded).
- [ ] Root script `npm run data:perf`; document that DOCKER perf runs pre-register these users through `ApiSeeder` in setup.

---

## 4. Verification Commands

```bash
npm run build --workspace=packages/test-data
npx tsx --test packages/test-data/src/**/*.test.ts
cd playwright-e2e && ENV=DOCKER npx playwright test src/tests/api/CartAndInventory --config=src/config/playwright.config.ts --repeat-each=5
TEST_DATA_SEED=42 ENV=DOCKER npx playwright test src/tests/ui/Profile/Test_006_ProfileSummaryAndOrderHistory.spec.ts --config=src/config/playwright.config.ts
ENV=BOGUS npx playwright test --list --config=src/config/playwright.config.ts   # must fail fast with a readable error
```

---

## 5. Code Review Checklist

- [ ] Factories produce **unique** data under parallel workers (include worker index or random suffix, not just `Date.now()`).
- [ ] No real-looking PII; only test card numbers.
- [ ] The cleanup registry runs even when the test fails, and never masks the original failure.
- [ ] Migrated specs are faster or equal (record durations) and assert the same behaviour.
- [ ] Catalog entries for migrated specs unchanged in ID and intent (update the `Covered` column only if paths changed).

---

## 6. Definition of Done

- [ ] Package built and consumed by Playwright, Selenium (1 spec), and perf dataset generation.
- [ ] 5 reference specs migrated and green 5/5.
- [ ] Typed config fails fast on bad input.
- [ ] `docs/ReusablePackage.md` updated with a test-data section.

---

## 7. Deliverables Summary

| Artifact | Description |
| :--- | :--- |
| `packages/test-data/**` | Factories, builders, seeders, registry, constants |
| `playwright-e2e/src/core/base/data.fixture.ts` | `seed` / `cleanup` fixtures |
| `*/src/config/env.config.ts` | zod-validated config |
| `packages/test-data/scripts/generate-perf-datasets.ts` | Perf CSV/JSON generation |
