# Sprint 8.2: API Coverage Gaps & Negative Test Matrix

**Navigation**: [⬅️ Previous: Sprint 8.1](sprint_8_1_typed_api_client_layer_and_schema_validation.md) | [🗺️ Planning Hub](../README.md) | [Phase 8](../Phases/phase_8_api_depth_typed_clients_schemas_and_contracts.md) | [Next: Sprint 8.3 ➡️](sprint_8_3_openapi_specification_and_contract_testing.md)

**Sprint Identifier**: `SPRINT-8.2-API-COVERAGE-AND-NEGATIVE-MATRIX`
**Phase Mapping**: [Phase 8](../Phases/phase_8_api_depth_typed_clients_schemas_and_contracts.md)
**Estimated Velocity**: 5 Story Points
**Sprint Status**: Complete
**Branch**: `feat/sprint-8.2-api-coverage`
**Depends On**: Sprint 8.1
**Sprint Goal**: Reach 100% routed-endpoint coverage, add a systematic authorization and validation matrix, verify error-envelope consistency, and test Socket.IO at the protocol level.

---

## 1. Context & Evidence

Routes in `buggy-books/backend/src/routes/api.ts` plus `app.ts` (`/api/csrf-token`):

| Endpoint | Covered today? |
| :--- | :---: |
| `GET /books`, `GET /books/:id`, `POST /register`, `POST /login`, `POST /auth/refresh`, `GET/POST /cart`, `POST /checkout/process`, `GET /orders`, `GET /profile`, `POST /profile/upload`, `GET /inventory/report`, `GET /health`, test endpoints | ✅ |
| `DELETE /cart` | ✅ |
| `DELETE /cart/:bookId` | ✅ |
| `POST /logout` | ✅ |
| `GET /metrics` | ✅ |
| `GET /csrf-token` | ✅ |

---

## 2. Persona Roles & Ownership Matrix

| Persona | Responsibilities |
| :--- | :--- |
| **SDET Architect** | Matrix design, catalog IDs (`API-COV-*`, `API-AUTHZ-*`, `API-VAL-*`, `API-ERR-*`, `API-WS-*`) |
| **Playwright QA Lead** | Implementation |
| **DevOps Engineer** | API coverage script in PR gate |

---

## 3. Sprint Backlog & User Stories

### US-AF-821: Uncovered endpoints (1 SP)
New spec files under `src/tests/api/`:
- [x] `CartAndInventory/Test_003_CartRemovalApi.spec.ts` — remove a single item (stock and cart totals updated), clear the cart, remove a non-existent item (expected status), and remove from another session's cart (isolation).
- [x] `UserManagement/Test_003_LogoutApi.spec.ts` — logout clears the cookie; the old token and refresh token are rejected afterwards (if the backend doesn't revoke, mark `test.fail()` and document it as a finding).
- [x] `System/Test_001_MetricsAndCsrfApi.spec.ts` — `/metrics` schema (diagnostics payload) and no sensitive data in it; `/csrf-token` returns a token and sets the `psifi.x-csrf-token` cookie.

### US-AF-822: Authorization matrix (1.5 SP)
- [x] `Security/Test_001_AuthorizationMatrix.spec.ts` (API project) — data-driven:
  ```ts
  const PROTECTED = [
    { name: 'GET /cart',  call: (api, o) => api.cart.get(o) },
    { name: 'POST /cart', call: (api, o) => api.cart.add('1', o) },
    { name: 'DELETE /cart/:id', … }, { name: 'POST /checkout/process', … },
    { name: 'GET /orders', … }, { name: 'GET /profile', … }, { name: 'POST /profile/upload', … },
  ];
  const TOKEN_STATES = ['none', 'malformed', 'expired', 'wrongSignature'] as const;
  for (const ep of PROTECTED) for (const t of TOKEN_STATES)
    test(`API_AUTHZ_${ep.name} with ${t} token → 401 @regression @security`, …);
  ```
- [x] Token helpers in `test-data`: create an expired JWT and a wrong-signature JWT (sign with a random secret using `jose`).
- [x] Each case also asserts the error envelope schema (US-AF-824).

### US-AF-823: Validation & boundary matrix (1 SP)
- [x] `Validation/Test_001_InputValidationApi.spec.ts` using `INVALID_INPUTS` from `test-data`:
  - Register: empty, whitespace, 1-char, 256+ char, unicode/emoji, duplicate username, weak password.
  - Cart: quantity `0`, `-1`, `1.5`, `"abc"`, `Number.MAX_SAFE_INTEGER`; `bookId` non-existent, wrong type, injection string.
  - Checkout: missing fields, invalid card format, empty cart.
  - Search: very long query, special characters, regex metacharacters.
- [x] Expected: 4xx with a consistent envelope; **never 5xx**. Any 5xx becomes a `test.fail()` with an issue link in `buggy-books` (intentional bugs documented in `docs/intentional_bugs.md`).

### US-AF-824: Error envelope, idempotency, correlation, Socket.IO (1 SP)
- [x] `ErrorSchema` (strict): `{ error|message, correlationId? }`, no `stack`, no internal paths. Asserted across the matrix specs.
- [x] Concurrency: double-submit checkout with `Promise.all` → exactly one order and correct stock (complements UI `Test_007`).
- [x] Correlation: `x-correlation-id` sent equals the response header; generated when absent.
- [x] `Realtime/Test_001_SocketIoApi.spec.ts` with `socket.io-client`: connect/disconnect, the expected event payload shape, and with chaos `websocketDropRate` (validated in `testController.ts` as 0–1, read per session in `server.ts`) set to `1.0` the server force-disconnects immediately, and at `0.5` the client reconnects within N seconds. Pass `x-test-session-id` in the socket handshake so the chaos stays scoped to the test's session. Reset chaos in `afterEach`.

### US-AF-825: API coverage report (0.5 SP)
- [x] `scripts/api-coverage.ts`: parses the route list (from the OpenAPI spec once 8.3 lands; until then a checked-in `docs/api/routes.json` generated from `buggy-books`) and the network logs / client call registry from a test run → prints a covered/uncovered table, fails if a route is uncovered. Added to the nightly run (not the PR gate).

---

## 4. Verification Commands

```bash
cd playwright-e2e
ENV=DOCKER npx playwright test --project=api --config=src/config/playwright.config.ts --repeat-each=3
ENV=DOCKER npx playwright test --project=api --grep @security --config=src/config/playwright.config.ts --list | tail -1   # ≥ 28 authz cases
npx tsx ../scripts/api-coverage.ts --results test-results/results.json
npm run test:verify-catalog
```

---

## 5. Code Review Checklist

- [x] Matrix-generated test titles are unique and stable (catalog IDs map cleanly).
- [x] Chaos-mutating specs reset in `afterEach` (AGENTS.md §3).
- [x] No test depends on another's data; each uses `seed` + `cleanup`.
- [x] `test.fail()` entries reference a concrete intentional-bug section or an issue.
- [x] Socket tests close their sockets in teardown (no open handles).

---

## 6. Definition of Done

- [x] Coverage script reports 100% of routes.
- [x] All new specs green 3× on DOCKER (with documented `test.fail()` expectations).
- [x] Both catalogs updated (new IDs, tags, `Covered` paths) in lockstep.
- [x] Findings (real 5xx or missing token revocation) filed as issues in `buggy-books`, or added to `docs/intentional_bugs.md` if intentional.

---

## 7. Deliverables Summary

| Artifact | Description |
| :--- | :--- |
| `src/tests/api/CartAndInventory/Test_003_CartRemovalApi.spec.ts` | Cart removal coverage |
| `src/tests/api/UserManagement/Test_003_LogoutApi.spec.ts` | Logout and token revocation |
| `src/tests/api/System/Test_001_MetricsAndCsrfApi.spec.ts` | Metrics and CSRF token |
| `src/tests/api/Security/Test_001_AuthorizationMatrix.spec.ts` | AuthZ matrix |
| `src/tests/api/Validation/Test_001_InputValidationApi.spec.ts` | Validation matrix |
| `src/tests/api/Realtime/Test_001_SocketIoApi.spec.ts` | Socket.IO protocol tests |
| `scripts/api-coverage.ts` | Endpoint coverage gate |
