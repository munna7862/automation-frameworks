# Sprint 8.1: Typed API Client Layer & Schema Validation

**Navigation**: [⬅️ Previous: Sprint 7.3](sprint_7_3_dev_container_and_local_developer_experience.md) | [🗺️ Planning Hub](../README.md) | [Phase 8](../Phases/phase_8_api_depth_typed_clients_schemas_and_contracts.md) | [Next: Sprint 8.2 ➡️](sprint_8_2_api_coverage_gaps_and_negative_matrix.md)

**Sprint Identifier**: `SPRINT-8.1-TYPED-API-CLIENTS-AND-SCHEMAS`
**Phase Mapping**: [Phase 8](../Phases/phase_8_api_depth_typed_clients_schemas_and_contracts.md)
**Estimated Velocity**: 5 Story Points
**Sprint Status**: Done
**Branch**: `feat/sprint-8.1-api-clients-schemas`
**Depends On**: Sprint 7.2 (test-data seeders share the same client contracts)
**Sprint Goal**: Wrap the BuggyBooks API in typed clients exposed as fixtures, validate every response against a zod schema, and migrate all 55 API tests without changing test count or intent.

---

## 1. Persona Roles & Ownership Matrix

| Persona | Responsibilities |
| :--- | :--- |
| **SDET Architect** | Client/schema contracts, matcher API, migration plan |
| **Playwright QA Lead** | Implementation and migration of the 9 API spec files |
| **DevOps Engineer** | Lint rule wiring |

---

## 2. Technical Design

```text
playwright-e2e/src/api/
├── clients/
│   ├── base.client.ts          # wraps APIRequestContext; default headers; ApiResponse<T> envelope
│   ├── auth.client.ts          # register, login, logout, refresh, me/profile
│   ├── books.client.ts         # list(search?), get(id)
│   ├── cart.client.ts          # get, add, remove(bookId), clear
│   ├── checkout.client.ts      # process(details)
│   ├── orders.client.ts        # list
│   ├── profile.client.ts       # get, uploadAvatar(file)
│   ├── inventory.client.ts     # report
│   ├── system.client.ts        # health, metrics, csrfToken
│   └── test-control.client.ts  # config get/set, reset, setStock, deleteSession
├── schemas/
│   ├── book.schema.ts  cart.schema.ts  order.schema.ts  auth.schema.ts
│   ├── profile.schema.ts  inventory.schema.ts  error.schema.ts  health.schema.ts
│   └── index.ts
├── matchers/
│   └── api.matchers.ts         # expect.extend({ toMatchSchema, toRespondWithin, toHaveStatus })
└── api.fixture.ts              # `api` fixture = { auth, books, cart, … } bound to session-isolated request
```

**Client contract** (example):
```ts
export interface ApiResponse<T> {
  status: number;
  headers: Record<string, string>;
  body: T;            // parsed JSON (or text when not JSON)
  durationMs: number; // measured around the request
  raw: APIResponse;   // escape hatch
}

export class CartClient extends BaseClient {
  add(bookId: string, opts?: RequestOpts): Promise<ApiResponse<Cart>>;
  remove(bookId: string, opts?: RequestOpts): Promise<ApiResponse<Cart>>;
  clear(opts?: RequestOpts): Promise<ApiResponse<Cart>>;
}
// RequestOpts: { token?: string; headers?: Record<string,string>; enforceCsrf?: boolean }
```
- Clients **never assert**; they return `ApiResponse<T>`, so negative tests remain natural.
- The default `x-bypass-csrf` / `x-bypass-rate-limit` headers live in `BaseClient` only, and can be overridden (`enforceCsrf: true` sends `x-enforce-csrf: true`, which the backend supports for CSRF testing).

**Matchers**:
```ts
await expect(res).toHaveStatus(200);
await expect(res).toMatchSchema(BookListSchema);   // pretty zod error path in failure message
await expect(res).toRespondWithin(800);            // uses res.durationMs
```

---

## 3. Sprint Backlog & User Stories

### US-AF-811: Client layer + `api` fixture (2 SP)
- [x] Implement `base.client.ts` and the 10 clients above using the session-isolated `request` from `api.fixture.ts` (keep the `x-test-session-id` behaviour).
- [x] Redaction (Sprint 6.1) applied to any client debug logging.
- [x] Unit-level smoke: `src/api/__tests__/clients.smoke.spec.ts` hits each GET endpoint once on DOCKER.

### US-AF-812: zod schemas & custom matchers (1.5 SP)
- [x] Derive schemas from **actual DOCKER responses** (capture once with the network log), and cross-check against `buggy-books/backend/src/controllers/*` and `src/types/*.d.ts`.
- [x] Make `src/types/*.d.ts` derive from schemas (`z.infer<typeof BookSchema>`), so the hand-written duplicate types go away.
- [x] Implement matchers with clear failure output (endpoint, status, first 3 zod issues with paths).
- [x] `.strict()` vs `.passthrough()` policy: **strict** for error envelopes and auth payloads (catches leaked fields such as `passwordHash`); passthrough elsewhere, with a comment.

### US-AF-813: Migrate all 9 API spec files (1.5 SP)
- [x] Migrate `BookCatalog`, `CartAndInventory` (2), `ChaosAndTesting` (3), `Logging`, `UserManagement` (2), replacing raw calls with clients and adding `toMatchSchema` on every response.
- [x] Remove `axios` usage from API specs; `ApiUtil` remains only for UI specs that need out-of-band calls (and should migrate to `api` fixture where trivial).
- [x] ESLint `no-restricted-syntax` rule for `src/tests/api/**`: forbid `request.get|post|put|patch|delete(` member calls (message: "use api.* clients").
- [x] **Parity proof**: `npx playwright test --list --project=api` output before and after is identical (save both lists in the PR).

---

## 4. Verification Commands

```bash
cd playwright-e2e
npx playwright test --list --project=api --config=src/config/playwright.config.ts > /tmp/before.txt   # on main
# … after migration …
npx playwright test --list --project=api --config=src/config/playwright.config.ts > /tmp/after.txt
diff /tmp/before.txt /tmp/after.txt && echo "parity OK"
ENV=DOCKER npx playwright test --project=api --config=src/config/playwright.config.ts --repeat-each=3
npm run lint && npm run typecheck
```

---

## 5. Code Review Checklist

- [x] Clients contain no `expect` calls; specs contain no raw `request.*` calls.
- [x] Every API test has at least one `toMatchSchema`.
- [x] Schemas aren't so loose they're meaningless (no blanket `z.any()`; `z.unknown()` only with a justification comment).
- [x] Hand-written types removed or derived from schemas; no duplicated type definitions.
- [x] Test titles and IDs are unchanged (catalog parity unaffected).
- [x] Duration measurement wraps only the HTTP call.

---

## 6. Definition of Done

- [x] 55/55 API tests green 3× on DOCKER and 1× on STAGING.
- [x] `--list` parity proof attached.
- [x] Lint rule active and passing.
- [x] `docs/ReusablePackage.md` or a new `docs/api_testing_guide.md` documents clients, schemas and matchers.

---

## 7. Deliverables Summary

| Artifact | Description |
| :--- | :--- |
| `playwright-e2e/src/api/clients/*` | Typed clients |
| `playwright-e2e/src/api/schemas/*` | zod schemas (types derived from them) |
| `playwright-e2e/src/api/matchers/api.matchers.ts` | Custom matchers |
| `playwright-e2e/src/api/api.fixture.ts` | `api` fixture |
| `playwright-e2e/src/tests/api/**` | Migrated specs |
| `docs/api_testing_guide.md` | How-to guide |
