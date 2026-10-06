# Task Backlog: AutomationFrameworks Sprint Execution

## Current Focus: Sprint 8.2 — API Coverage Gaps & Negative Test Matrix

**Sprint Identifier**: `SPRINT-8.2-API-COVERAGE-AND-NEGATIVE-MATRIX`  
**Phase**: Phase 8 (API Depth: Typed Clients, Schemas & Contracts)  
**Story Points**: 5 SP  
**Branch**: `feat/sprint-8.2-api-coverage`  
**Goal**: Reach 100% routed-endpoint coverage, add a systematic authorization and validation matrix, verify error-envelope consistency, and test Socket.IO at the protocol level.

---

## 1. Persona Roles & Ownership Matrix

| Persona                | Role Assignment              | Responsibilities for this Sprint                                                                                             | Status    |
| :--------------------- | :--------------------------- | :--------------------------------------------------------------------------------------------------------------------------- | :-------- |
| **Scrum Master**       | `role-scrum-master`          | Sprint planning, `task.md` tracking, DoR verification, and DoD audit.                                                        | `ACTIVE`  |
| **SDET Architect**     | `role-sdet-architect`        | Matrix contract design, catalog IDs (`API-COV-*`, `API-AUTHZ-*`, `API-VAL-*`, `API-ERR-*`, `API-WS-*`), dual-catalog parity. | `ACTIVE`  |
| **Playwright QA Lead** | `role-playwright-automation` | Implement uncovered endpoint specs, authorization matrix, validation matrix, Socket.IO spec, and client helpers.             | `ACTIVE`  |
| **DevOps Engineer**    | `role-devops-engineer`       | API coverage script `scripts/api-coverage.ts`, CI gate integration, and PR release lifecycle.                                | `ACTIVE`  |
| **Product Owner**      | Human Tech Lead (`User`)     | Backlog prioritization, sprint kickoff, and final PR review & merge.                                                         | `STANDBY` |

---

## 2. Granular Task Breakdown

### US-AF-821: Uncovered Endpoints (1 SP)

- [x] **US-AF-821.1** (`SDET Architect`): Define scenario contracts and catalog entries for `DELETE /cart`, `DELETE /cart/:bookId`, `POST /logout`, `GET /metrics`, `GET /csrf-token`.
- [x] **US-AF-821.2** (`Playwright QA Lead`): Implement `playwright-e2e/src/tests/api/CartAndInventory/Test_003_CartRemovalApi.spec.ts` (single item removal, stock/total assertions, cart clear, non-existent item removal, cross-session isolation).
- [x] **US-AF-821.3** (`Playwright QA Lead`): Implement `playwright-e2e/src/tests/api/UserManagement/Test_003_LogoutApi.spec.ts` (cookie clear verification, token rejection assertion marked `test.fail()` if backend lacks server-side JWT revocation, documented as finding).
- [x] **US-AF-821.4** (`Playwright QA Lead`): Implement `playwright-e2e/src/tests/api/System/Test_001_MetricsAndCsrfApi.spec.ts` (`/metrics` diagnostics schema validation without sensitive data leaks, `/csrf-token` response and cookie assertion).

### US-AF-822: Authorization Matrix (1.5 SP)

- [x] **US-AF-822.1** (`SDET Architect`): Design data-driven matrix over protected endpoints (`GET /cart`, `POST /cart`, `DELETE /cart`, `DELETE /cart/:bookId`, `POST /checkout/process`, `GET /orders`, `GET /profile`, `POST /profile/upload`) and token states (`none`, `malformed`, `expired`, `wrongSignature`).
- [x] **US-AF-822.2** (`SDET Architect` & `Playwright QA Lead`): Author JWT token test helpers in `packages/test-data/src/helpers/jwt-tokens.ts` using `jose` (expired token, wrong-signature token, malformed token).
- [x] **US-AF-822.3** (`Playwright QA Lead`): Implement `playwright-e2e/src/tests/api/Security/Test_001_AuthorizationMatrix.spec.ts` executing the authorization test matrix, asserting 401/403 rejection and strict error envelope schema (`ApiErrorResponseSchema`).

### US-AF-823: Validation & Boundary Matrix (1 SP)

- [x] **US-AF-823.1** (`SDET Architect`): Map boundary matrices for register, cart, checkout, and search across `INVALID_INPUTS` constants.
- [x] **US-AF-823.2** (`Playwright QA Lead`): Implement `playwright-e2e/src/tests/api/Validation/Test_001_InputValidationApi.spec.ts`:
  - Registration boundaries (empty, whitespace, 1-char, 256+ char, emoji, duplicate username, weak password).
  - Cart item boundaries (quantity 0, -1, 1.5, non-numeric, MAX_SAFE_INTEGER; invalid/non-existent bookId, injection string).
  - Checkout payload boundaries (missing shipping fields, invalid card format, empty cart).
  - Search query boundaries (very long query, special chars, regex metacharacters).
  - Assert 4xx response with structured error envelope; flag any unexpected 5xx with `test.fail()` linking to bug documentation.

### US-AF-824: Error Envelope, Idempotency, Correlation, Socket.IO (1 SP)

- [x] **US-AF-824.1** (`SDET Architect` & `Playwright QA Lead`): Validate strict error envelope compliance across all negative tests (`ApiErrorResponseSchema`: no stack in production, no internal system leaks).
- [x] **US-AF-824.2** (`Playwright QA Lead`): Add concurrency & idempotency tests (double-submit checkout via `Promise.all` guaranteeing exactly one order created and correct inventory decrement).
- [x] **US-AF-824.3** (`Playwright QA Lead`): Add correlation ID validation (inbound `x-correlation-id` echoed back in response header, auto-generated UUID when omitted).
- [x] **US-AF-824.4** (`Playwright QA Lead`): Implement `playwright-e2e/src/tests/api/Realtime/Test_001_SocketIoApi.spec.ts` using `socket.io-client`:
  - Connection/disconnection lifecycle.
  - Verification of `bookstore-event` payload shape (`id`, `type`, `message`, `timestamp`).
  - Chaos simulation: `websocketDropRate = 1.0` triggers immediate disconnect; `websocketDropRate = 0.5` triggers client reconnection within SLA. Scoped by `x-test-session-id`. Teardown clean socket closing and chaos reset.

### US-AF-825: API Coverage Report (0.5 SP)

- [x] **US-AF-825.1** (`DevOps Engineer`): Generate `docs/api/routes.json` cataloging all routed endpoints and HTTP methods from BuggyBooks.
- [x] **US-AF-825.2** (`DevOps Engineer`): Author `scripts/api-coverage.ts` inspecting test run output / client usage to verify 100% route coverage and output coverage summary table.
- [x] **US-AF-825.3** (`DevOps Engineer`): Wire `npm run test:api-coverage` script into root `package.json`.

### Traceability, DoD & Release Protocol

- [x] **US-AF-820.1** (`Scrum Master`): Verify Pre-Flight Definition of Ready (DoR).
- [x] **US-AF-820.2** (`SDET Architect`): Maintain 100% lockstep parity across dual test case catalogs (`docs/test_cases_catalog.md` and `playwright-e2e/test_cases_catalog.md`).
- [x] **US-AF-820.3** (`SDET Architect`): Perform Code Acceptance Review on all authored spec files and helpers.
- [x] **US-AF-820.4** (`Scrum Master`): Verify 4-Point Definition of Done (DoD) (lint: 0, typecheck: 0, 100% green pass, dual-catalog sync).
- [x] **US-AF-820.5** (`DevOps Engineer`): Execute PR release lifecycle with conventional commit and GitHub CLI.

---

## 3. Sprint Review Comments & Refinement Loop

| Gate / Reviewer                  | Target Role              | Review Feedback & Comments                                                        | Gate Status  |
| :------------------------------- | :----------------------- | :-------------------------------------------------------------------------------- | :----------: |
| **Pre-Flight Architecture Gate** | SDET Architect           | Verify test matrix design, endpoint catalog, and DoR conditions.                  | `[APPROVED]` |
| **Code Acceptance Review Gate**  | SDET Architect           | Verify single-browser rule (Chrome only), 0 blind timeouts, teardown state reset. | `[APPROVED]` |
| **Scrum Master DoD Gate**        | Scrum Master             | Audit lint, typecheck, 100% green pass rate, and catalog diff.                    | `[APPROVED]` |
| **DevOps Release Gate**          | DevOps Engineer          | Validate CI workflows, PR creation, and green CI status.                          | `[APPROVED]` |
| **Final Human Sign-Off**         | Human Tech Lead (`User`) | Final PR review and merge to `main`.                                              |  `STANDBY`   |

---

## 4. Definition of Done (DoD) Checklist

- [x] `npm run lint:all` and `npm run typecheck:all` pass across all active workspaces with 0 errors.
- [x] 100% deterministic green execution across authored test specs (no flaky retries).
- [x] Dual-catalog parity confirmed: `git diff --exit-code docs/test_cases_catalog.md playwright-e2e/test_cases_catalog.md` exits 0.
- [x] Single-browser execution policy strictly preserved (Google Chrome UI + API only).
- [x] Teardown state reset probe (`POST /api/test/reset` and chaos config reset) verified in all chaos-mutating tests.
- [x] API coverage script reports 100% coverage across all routed endpoints.
- [x] Sprint documentation and `docs/intentional_bugs.md` updated where applicable.
- [x] Pull request opened with structured summary and verification evidence (`gh pr create`).

---

## 5. Verification & Execution Evidence

```bash
# Command 1: Dual-catalog parity check
npm run test:verify-catalog

# Command 2: Static analysis
npm run lint:all
npm run typecheck:all

# Command 3: Deterministic test execution
cross-env ENV=STAGING npx playwright test --project=api --config=src/config/playwright.config.ts

# Command 4: API coverage verification
npm run test:api-coverage
```
