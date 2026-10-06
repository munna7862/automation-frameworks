# Task Backlog: AutomationFrameworks Sprint Execution

## Current Focus: Sprint 8.1 — Typed API Client Layer & Schema Validation

**Sprint Identifier**: `SPRINT-8.1-TYPED-API-CLIENTS-AND-SCHEMAS`  
**Phase**: Phase 8 (API Depth: Typed Clients, Schemas & Contracts)  
**Story Points**: 5 SP  
**Branch**: `feat/sprint-8.1-api-clients-schemas`  
**Goal**: Wrap the BuggyBooks API in typed clients exposed as fixtures, validate every response against a zod schema, and migrate all 55 API tests without changing test count or intent.

---

## 1. Persona Roles & Ownership Matrix

| Persona                | Role Assignment              | Responsibilities for this Sprint                                                                                               | Status    |
| :--------------------- | :--------------------------- | :----------------------------------------------------------------------------------------------------------------------------- | :-------- |
| **Scrum Master**       | `role-scrum-master`          | Sprint planning, `task.md` tracking, DoR verification, and DoD audit.                                                          | `ACTIVE`  |
| **SDET Architect**     | `role-sdet-architect`        | Client/schema contracts, matcher API, type derivation, dual-catalog sync, and code acceptance review.                          | `ACTIVE`  |
| **Playwright QA Lead** | `role-playwright-automation` | Implement base & 10 domain clients, zod schemas, custom matchers, `api` fixture, smoke spec, and migrate all 9 API spec files. | `ACTIVE`  |
| **DevOps Engineer**    | `role-devops-engineer`       | ESLint `no-restricted-syntax` rule wiring, CI verification, and PR release lifecycle.                                          | `ACTIVE`  |
| **Product Owner**      | Human Tech Lead (`User`)     | Backlog prioritization, sprint kickoff, and final PR review & merge.                                                           | `STANDBY` |

---

## 2. Granular Task Breakdown

### US-AF-811: Client Layer + `api` Fixture (2 SP)

- [x] **US-AF-811.1** (`SDET Architect`): Design `ApiResponse<T>` envelope, `RequestOpts` contract, and client architecture.
- [x] **US-AF-811.2** (`Playwright QA Lead`): Implement `playwright-e2e/src/api/clients/base.client.ts` with timing measurement (`durationMs`), default headers (`x-bypass-rate-limit`, `x-test-session-id`, `enforceCsrf`), and sensitive data redaction.
- [x] **US-AF-811.3** (`Playwright QA Lead`): Implement all 10 domain clients in `playwright-e2e/src/api/clients/`:
  - `auth.client.ts` (register, login, logout, refresh, me)
  - `books.client.ts` (list, getById)
  - `cart.client.ts` (get, add, remove, clear)
  - `checkout.client.ts` (process)
  - `orders.client.ts` (list)
  - `profile.client.ts` (get, uploadAvatar)
  - `inventory.client.ts` (report)
  - `system.client.ts` (health, metrics, csrfToken)
  - `test-control.client.ts` (getConfig, setConfig, reset, setStock, deleteSession)
  - `index.ts` (barrel export and `createApiClient` factory)
- [x] **US-AF-811.4** (`Playwright QA Lead`): Implement `playwright-e2e/src/api/api.fixture.ts` exporting test fixture providing `{ api, testSessionId }`.
- [x] **US-AF-811.5** (`Playwright QA Lead`): Author `playwright-e2e/src/api/__tests__/clients.smoke.spec.ts` hitting GET endpoints across clients (8/8 pass).

### US-AF-812: Zod Schemas & Custom Matchers (1.5 SP)

- [x] **US-AF-812.1** (`Playwright QA Lead`): Add `zod` dependency to `playwright-e2e/package.json`.
- [x] **US-AF-812.2** (`SDET Architect` & `Playwright QA Lead`): Author exhaustive Zod schemas in `playwright-e2e/src/api/schemas/`:
  - `book.schema.ts` (`BookSchema`, `PaginatedBooksSchema`, `CartItemSchema`)
  - `cart.schema.ts` (`CartSchema`, `CartClearResponseSchema`)
  - `order.schema.ts` (`OrderSchema`, `OrdersListSchema`, `CheckoutResponseSchema`)
  - `auth.schema.ts` (`AuthTokensResponseSchema`, `UserRecordSchema`, `AuthUserSchema`, `LogoutResponseSchema`)
  - `profile.schema.ts` (`UserProfileSchema`, `AvatarUploadResponseSchema`)
  - `inventory.schema.ts` (`InventoryReportSchema`)
  - `health.schema.ts` (`HealthSchema`, `MetricsSchema`, `CsrfTokenSchema`)
  - `error.schema.ts` (`ApiErrorResponseSchema`, strict validation)
  - `test-control.schema.ts` (`ChaosConfigSchema`, `TestConfigPostResponseSchema`, `TestResetResponseSchema`, `TestSessionDeleteResponseSchema`)
  - `index.ts` (barrel export)
- [x] **US-AF-812.3** (`SDET Architect`): Refactor `playwright-e2e/src/types/*.d.ts` to derive canonical types from Zod schemas (`z.infer<typeof ...>`).
- [x] **US-AF-812.4** (`Playwright QA Lead`): Implement custom Playwright matchers in `playwright-e2e/src/api/matchers/api.matchers.ts`:
  - `toMatchSchema(schema)` (formatted zod error paths)
  - `toRespondWithin(maxMs)` (duration check)
  - `toHaveStatus(status)` (status assertion with error body dump on mismatch)
- [x] **US-AF-812.5** (`Playwright QA Lead`): Wire matchers into `api.fixture.ts` and global expectations.

### US-AF-813: Migrate All 9 API Spec Files (1.5 SP)

- [x] **US-AF-813.1** (`Playwright QA Lead`): Migrate `src/tests/api/BookCatalog/Test_001_BooksApi.spec.ts` to use `api.books` and schema assertions.
- [x] **US-AF-813.2** (`Playwright QA Lead`): Migrate `src/tests/api/CartAndInventory/Test_001_CartAndInventoryApi.spec.ts` to use `api.cart` and `api.inventory`.
- [x] **US-AF-813.3** (`Playwright QA Lead`): Migrate `src/tests/api/CartAndInventory/Test_002_OrdersApi.spec.ts` to use `api.orders`.
- [x] **US-AF-813.4** (`Playwright QA Lead`): Migrate `src/tests/api/ChaosAndTesting/Test_001_ChaosAndTestingApi.spec.ts` to use `api.testControl`, `api.auth`, `api.cart`, `api.checkout`.
- [x] **US-AF-813.5** (`Playwright QA Lead`): Migrate `src/tests/api/ChaosAndTesting/Test_002_VisualChaosApi.spec.ts` to use `api.testControl`.
- [x] **US-AF-813.6** (`Playwright QA Lead`): Migrate `src/tests/api/ChaosAndTesting/Test_003_SessionSandboxingApi.spec.ts` to use isolated `createApiClient(requestA/B)`.
- [x] **US-AF-813.7** (`Playwright QA Lead`): Migrate `src/tests/api/Logging/Test_001_LoggingAndCorrelationApi.spec.ts` to use clients with headers preservation.
- [x] **US-AF-813.8** (`Playwright QA Lead`): Migrate `src/tests/api/UserManagement/Test_001_RegisterAndLoginUser.spec.ts` to use `api.auth` with schema validations.
- [x] **US-AF-813.9** (`Playwright QA Lead`): Migrate `src/tests/api/UserManagement/Test_002_TokenRefreshAndProfileApi.spec.ts` to use `api.auth`, `api.profile`, `api.cart`, `api.testControl`.
- [x] **US-AF-813.10** (`DevOps Engineer`): Add ESLint `no-restricted-syntax` rule forbidding raw `request.get|post|put|patch|delete` in `src/tests/api/**`.
- [x] **US-AF-813.11** (`SDET Architect`): Verify test list parity before and after migration (`npx playwright test --list --project=api` yields exactly 55/55 identical titles).
- [x] **US-AF-813.12** (`SDET Architect`): Author developer guide `docs/api_testing_guide.md` and update planning documentation.

### Verification, DoD & Release Protocol

- [x] **US-AF-810.1** (`Scrum Master`): Verify Pre-Flight Definition of Ready (DoR).
- [x] **US-AF-810.2** (`SDET Architect`): Perform Code Review Checklist and Code Acceptance Review.
- [x] **US-AF-810.3** (`Scrum Master`): Verify 4-Point Definition of Done (DoD).
- [x] **US-AF-810.4** (`DevOps Engineer`): Execute PR release lifecycle with conventional commit and GitHub CLI.

---

## 3. Sprint Review Comments & Refinement Loop

| Gate / Reviewer                  | Target Role              | Review Feedback & Comments                                                                                                               | Gate Status  |
| :------------------------------- | :----------------------- | :--------------------------------------------------------------------------------------------------------------------------------------- | :----------: |
| **Pre-Flight Architecture Gate** | SDET Architect           | Verify typed client architecture, schema strictness policy, and backward compatibility.                                                  | `[APPROVED]` |
| **Code Acceptance Review Gate**  | SDET Architect           | Verified clients contain no `expect`, specs contain no raw `request.*`, schemas typed and derived, test titles 100% identical.           | `[APPROVED]` |
| **Scrum Master DoD Gate**        | Scrum Master             | All 4 DoD criteria verified: lint 0 errors across 7 workspaces; typecheck 0 errors; 55/55 API tests green; dual-catalog parity verified. | `[APPROVED]` |
| **DevOps Release Gate**          | DevOps Engineer          | Validate ESLint rule active, workspaces clean, PR created, and green CI status.                                                          | `[APPROVED]` |
| **Final Human Sign-Off**         | Human Tech Lead (`User`) | Final PR review and merge to `main`.                                                                                                     |  `STANDBY`   |

---

## 4. Definition of Done (DoD) Checklist

- [x] All 10 typed clients implemented in `playwright-e2e/src/api/clients/*`.
- [x] Zod schemas implemented in `playwright-e2e/src/api/schemas/*` with strict mode on error envelopes & auth.
- [x] Shared types in `playwright-e2e/src/types/*` derived from Zod schemas.
- [x] Custom matchers (`toMatchSchema`, `toRespondWithin`, `toHaveStatus`) implemented.
- [x] All 9 API test specs migrated to `api.*` clients and `toMatchSchema`.
- [x] ESLint `no-restricted-syntax` rule active for `src/tests/api/**`.
- [x] Test list before and after is 100% identical (55 tests in 9 files).
- [x] 55/55 API tests green.
- [x] `docs/api_testing_guide.md` created.
- [x] `npm run lint:all` and `npm run typecheck:all` exit 0 across all workspaces.
- [x] `npm run test:verify-catalog` exits 0 (dual-catalog parity).
- [x] Pull request opened with structured summary and verification evidence.

---

## 5. Verification & Execution Evidence

```bash
# 1. Dual-Catalog Parity: 182/182 test cases verified
npm run test:verify-catalog
# Output: ✅ PARITY VERIFIED: Both catalogs are 100% character-for-character identical.

# 2. Monorepo Static Typechecking: 7/7 workspaces clean
npm run typecheck:all
# Output: @automationframeworks/playwright-utils, @automationframeworks/test-data, playwright-e2e, selenium-e2e, wdio-e2e, mobile-automation all exit 0

# 3. Monorepo Linting: 7/7 workspaces clean
npm run lint:all
# Output: All workspaces exit 0 with 0 errors and 0 warnings (no-restricted-syntax active)

# 4. Parity Proof: Playwright API Test Discovery Before vs After
# Output: BEFORE COUNT: 55, AFTER COUNT: 55
# ✅ PERFECT TITLE & COUNT PARITY: Exactly 55/55 matching test titles

# 5. Unit Smoke Test: 8/8 GET endpoints pass schema validation
npx tsx --test src/api/__tests__/clients.smoke.spec.ts
# Output: 8 passed (0 failed, 0 flaky)

# 6. Playwright API Execution on Staging
cross-env ENV=STAGING npm run test:api --workspace=playwright-e2e
# Output: 55 passed (32.5s) - 100% green
```
