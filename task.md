# Task Backlog: AutomationFrameworks Sprint Execution

## Current Focus: Sprint 7.2 — Test Data Engineering & Typed Configuration

**Sprint Identifier**: `SPRINT-7.2-TEST-DATA-ENGINEERING`  
**Phase**: Phase 7 (Hermetic Environments, Test Data & Developer Experience)  
**Story Points**: 4 SP  
**Branch**: `feat/sprint-7.2-test-data`  
**Goal**: Introduce a shared test-data package (factories, builders, API seeders, cleanup registry) and zod-validated typed configuration, so tests create exactly the state they need through the API and clean it up deterministically.

---

## 1. Persona Roles & Ownership Matrix

| Persona                  | Role Assignment              | Responsibilities for this Sprint                                                                                           | Status    |
| :----------------------- | :--------------------------- | :------------------------------------------------------------------------------------------------------------------------- | :-------- |
| **Scrum Master**         | `role-scrum-master`          | Sprint kick-off, DoR verification, DoD audit, and velocity tracking.                                                       | `ACTIVE`  |
| **SDET Architect**       | `role-sdet-architect`        | Package API design (builders, seeders, registry contracts), zod config schema, dual-catalog sync, code acceptance review.  | `ACTIVE`  |
| **Playwright QA Lead**   | `role-playwright-automation` | Fixture integration in `data.fixture.ts`, merge into `base.fixture` / `api.fixture`, migrate 4 Playwright reference specs. | `ACTIVE`  |
| **Selenium Specialist**  | `role-selenium-specialist`   | Consume seeders for setup in `Test_001_Selenium_Auth.spec.ts` with axios HttpLike adapter.                                 | `ACTIVE`  |
| **Performance Engineer** | `role-performance-engineer`  | Author perf dataset generator (`generate-perf-datasets.ts`), root script `npm run data:perf`, and dataset parity.          | `ACTIVE`  |
| **DevOps Engineer**      | `role-devops-engineer`       | Build integration, CI checks, documentation synchronization, and PR release lifecycle.                                     | `ACTIVE`  |
| **Product Owner**        | Human Tech Lead (`User`)     | Backlog prioritization, final PR review & merge.                                                                           | `STANDBY` |

---

## 2. Granular Task Breakdown

### US-AF-721: `@automationframeworks/test-data` Package Architecture (1.5 SP)

- [x] **US-AF-721.1** (`SDET Architect`): Scaffold `packages/test-data` with `package.json`, `tsconfig.json`, `eslint.config.mjs`, `src/index.ts`, and wire dependencies (`@faker-js/faker`, `zod`).
- [x] **US-AF-721.2** (`SDET Architect`): Implement seedable faker provider (`TEST_DATA_SEED` env var support, deterministic replay, seed logging).
- [x] **US-AF-721.3** (`SDET Architect`): Implement factories and builders: `UserFactory`, `CheckoutDetailsFactory`, `UserBuilder`.
- [x] **US-AF-721.4** (`SDET Architect`): Implement shared constants: `TEST_CARD_NUMBERS`, `KNOWN_BOOK_IDS`, and `INVALID_INPUTS`.
- [x] **US-AF-721.5** (`SDET Architect`): Author comprehensive unit tests in `packages/test-data/src/**/*.test.ts` verifying uniqueness under parallel workers, reproducible seeding, and builder contracts (14/14 tests passing).

### US-AF-722: API Seeders & Cleanup Registry (1.5 SP)

- [x] **US-AF-722.1** (`SDET Architect`): Implement `HttpLike` interface and `ApiSeeder` (`createUser`, `login`, `addToCart`, `placeOrder`, `setStock`).
- [x] **US-AF-722.2** (`SDET Architect`): Implement `CleanupRegistry` (LIFO execution, non-blocking error containment, Allure step/attachment warnings).
- [x] **US-AF-722.3** (`Playwright QA Lead`): Implement `playwright-e2e/src/core/base/data.fixture.ts` with `seed` and `cleanup` fixtures, and merge into `base.fixture.ts` & `api.fixture.ts`.
- [x] **US-AF-722.4** (`Playwright QA Lead`): Migrate reference spec 1: `Test_002_OrdersApi.spec.ts` to consume `seed.createAndLoginUser` and `seed.placeOrder`.
- [x] **US-AF-722.5** (`Playwright QA Lead`): Migrate reference spec 2: `Test_001_CartAndInventoryApi.spec.ts` to consume `seed.createAndLoginUser` and `seed.addToCart`.
- [x] **US-AF-722.6** (`Playwright QA Lead`): Migrate reference spec 3: `Test_006_ProfileSummaryAndOrderHistory.spec.ts` (API-seeded user/order state, UI validation).
- [x] **US-AF-722.7** (`Playwright QA Lead`): Migrate reference spec 4: `Test_006_CartQuantityAdjustment.spec.ts` to consume `UserFactory` with zero hard-coded credentials.
- [x] **US-AF-722.8** (`Selenium Specialist`): Migrate reference spec 5: `Test_001_Selenium_Auth.spec.ts` to consume `ApiSeeder` with axios `HttpLike` client.

### US-AF-723: Typed, Validated Configuration (0.5 SP)

- [x] **US-AF-723.1** (`SDET Architect`): Author shared zod configuration schema in `packages/test-data/src/config/schema.ts` (`ENV` enum `DOCKER|STAGING|INTEROP`, valid URLs, coerced booleans, conditional staging credential requirements).
- [x] **US-AF-723.2** (`SDET Architect`): Refactor `playwright-e2e/src/config/env.config.ts` to validate using zod with fast fail and formatted error block.
- [x] **US-AF-723.3** (`Selenium Specialist`): Refactor `selenium-e2e/src/config/env.config.ts` with zod validation.
- [x] **US-AF-723.4** (`Selenium Specialist`): Refactor `wdio-e2e/src/config/env.config.ts` with zod validation.

### US-AF-724: Performance Datasets From Single Source (0.5 SP)

- [x] **US-AF-724.1** (`Performance Engineer`): Author `packages/test-data/scripts/generate-perf-datasets.ts` writing `jmeter/TestData/users.csv` and `k6-performance/data/users.json` from `UserFactory`.
- [x] **US-AF-724.2** (`Performance Engineer`): Add root npm script `"data:perf": "tsx packages/test-data/scripts/generate-perf-datasets.ts"`.
- [x] **US-AF-724.3** (`Performance Engineer`): Verify dataset generation and documented ephemeral setup integration.

### Verification, DoD & Release Protocol

- [x] **US-AF-720.1** (`Scrum Master`): Verify Pre-Flight Definition of Ready (DoR).
- [x] **US-AF-720.2** (`SDET Architect`): Conduct Code Acceptance Review on package exports, fixtures, zod error handling, and migrated specs.
- [x] **US-AF-720.3** (`Scrum Master`): Verify 4-point Definition of Done (DoD).
- [x] **US-AF-720.4** (`DevOps Engineer`): Update documentation (`docs/ReusablePackage.md`, sprint plans) and execute PR release lifecycle.

---

## 3. Sprint Review Comments & Refinement Loop

| Gate / Reviewer                  | Target Role              | Review Feedback & Comments                                                                                    | Gate Status  |
| :------------------------------- | :----------------------- | :------------------------------------------------------------------------------------------------------------ | :----------: |
| **Pre-Flight Architecture Gate** | SDET Architect           | Package design, HttpLike adapter, LIFO CleanupRegistry, and zod schema validated and approved.                | `[APPROVED]` |
| **Code Acceptance Review Gate**  | SDET Architect           | Verified parallel worker isolation, test cards only, non-blocking cleanup, fast failure on invalid ENV.       | `[APPROVED]` |
| **Scrum Master DoD Gate**        | Scrum Master             | 14/14 package unit tests green; 5/5 migrated reference specs green; dual-catalog parity verified; lint 0 err. | `[APPROVED]` |
| **DevOps Release Gate**          | DevOps Engineer          | Package build clean; root npm scripts wired; docs synchronized; ready for branch push and PR creation.        | `[APPROVED]` |
| **Final Human Sign-Off**         | Human Tech Lead (`User`) | Final PR review and merge to `main`.                                                                          |  `STANDBY`   |

---

## 4. Definition of Done (DoD) Checklist

- [x] `packages/test-data` built to `dist` (`npm run build --workspace=packages/test-data`) with clean CommonJS and declaration files.
- [x] Unit tests pass: `npx tsx --test packages/test-data/src/test-data.test.ts` (14/14 tests pass).
- [x] 5 reference specs migrated and pass deterministically:
  - `Test_002_OrdersApi.spec.ts` (Passed with ApiSeeder + KNOWN_BOOK_IDS)
  - `Test_001_CartAndInventoryApi.spec.ts` (Passed with ApiSeeder + KNOWN_BOOK_IDS)
  - `Test_006_ProfileSummaryAndOrderHistory.spec.ts` (Passed with seeded user/order + UI validation)
  - `Test_006_CartQuantityAdjustment.spec.ts` (Passed with UserFactory)
  - `Test_001_Selenium_Auth.spec.ts` (Passed with ApiSeeder + Axios adapter)
- [x] Typed config fails fast on `ENV=BOGUS` with readable error block.
- [x] Performance dataset generator (`npm run data:perf`) outputs valid CSV and JSON datasets.
- [x] Dual-catalog parity confirmed: `npm run test:verify-catalog` exits 0.
- [x] `npm run lint:all` and `npm run typecheck:all` exit 0 across all workspaces.
- [x] `docs/ReusablePackage.md` updated with `@automationframeworks/test-data` usage guide.
- [x] Pull request opened with structured summary and verification evidence: [PR #42](https://github.com/munna7862/automation-frameworks/pull/42).
- [x] All 14 CI checks 100% green (Smoke Tests, CodeQL SAST, Dependency Review, k6 Performance Drift Gate, Actionlint, Zizmor, Gitleaks, License Compliance, OSV Scanner, Static Quality).

---

## 5. Verification & Execution Evidence

```bash
# 1. Package build and unit tests (14/14 pass)
npm run build --workspace=packages/test-data
npx tsx --test packages/test-data/src/test-data.test.ts

# 2. Performance dataset generation
npm run data:perf
# Output: jmeter/TestData/users.csv (21 rows), k6-performance/data/users.json (21 entries)

# 3. Fast fail on bogus config
ENV=BOGUS npx playwright test --list --config=src/config/playwright.config.ts
# Output: Exited 1 with formatted error block: [ENV]: Invalid environment 'BOGUS'

# 4. Reference specs execution
# Cart & Inventory API specs (15/15 repeat-each=5 pass):
ENV=STAGING npx playwright test src/tests/api/CartAndInventory --config=src/config/playwright.config.ts --repeat-each=5

# Profile UI spec with active seed:
TEST_DATA_SEED=42 ENV=STAGING npx playwright test src/tests/ui/Profile/Test_006_ProfileSummaryAndOrderHistory.spec.ts --config=src/config/playwright.config.ts

# Cart Quantity UI spec:
ENV=STAGING npx playwright test src/tests/ui/Checkout/Test_006_CartQuantityAdjustment.spec.ts --config=src/config/playwright.config.ts

# Selenium Auth smoke spec:
npm run test:smoke --workspace=selenium-e2e
```
