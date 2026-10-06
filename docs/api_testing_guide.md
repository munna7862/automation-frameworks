# BuggyBooks Typed API Client Layer & Schema Validation Guide

## 1. Overview & Architecture

Sprint 8.1 introduces a centralized, typed API client layer and automated Zod runtime schema validation across the BuggyBooks test automation framework. Direct HTTP request invocations (e.g. `request.get(...)`, `request.post(...)`) in API tests are replaced by strongly-typed domain clients exposed via Playwright fixtures.

```text
playwright-e2e/src/api/
├── clients/
│   ├── base.client.ts          # Core HTTP engine: timing, bypass headers, secret redaction, ApiResponse<T>
│   ├── auth.client.ts          # Authentication: register, login, logout, refresh, me
│   ├── books.client.ts         # Catalog: list(params), getById(id)
│   ├── cart.client.ts          # Cart: get, add, remove, clear
│   ├── checkout.client.ts      # Checkout: process(details)
│   ├── orders.client.ts        # Order history: list
│   ├── profile.client.ts       # Profile: get, uploadAvatar
│   ├── inventory.client.ts     # Warehouse: report
│   ├── system.client.ts        # Observability: health, metrics, csrfToken
│   ├── test-control.client.ts  # Chaos knobs: getConfig, setConfig, reset, deleteSession
│   └── index.ts                # createApiClient() factory & barrel export
├── schemas/
│   ├── book.schema.ts          # BookSchema, PaginatedBooksSchema, CartItemSchema
│   ├── cart.schema.ts          # CartSchema, CartClearResponseSchema
│   ├── order.schema.ts         # OrderSchema, OrdersListSchema, CheckoutResponseSchema
│   ├── auth.schema.ts          # AuthTokensResponseSchema (strict), UserRecordSchema, LogoutResponseSchema
│   ├── profile.schema.ts       # UserProfileSchema, AvatarUploadResponseSchema
│   ├── inventory.schema.ts     # InventoryReportSchema
│   ├── health.schema.ts        # HealthSchema, MetricsSchema, CsrfTokenSchema
│   ├── error.schema.ts         # ApiErrorResponseSchema (strict)
│   ├── test-control.schema.ts  # ChaosConfigSchema, TestConfigPostResponseSchema, TestResetResponseSchema
│   └── index.ts                # Shared schemas barrel
├── matchers/
│   └── api.matchers.ts         # Custom expect matchers: toMatchSchema, toRespondWithin, toHaveStatus
└── api.fixture.ts              # Playwright test fixture binding `api` client hub and session sandboxing
```

---

## 2. The `ApiResponse<T>` Contract & Base Client

Every client method returns an `ApiResponse<T>` envelope containing parsed data, raw Playwright response, response headers, and measured duration:

```typescript
export interface ApiResponse<T = any> {
  status: number;
  headers: Record<string, string>;
  body: T;            // Parsed JSON body (or text if non-JSON)
  durationMs: number; // Execution time measured strictly around the HTTP call
  raw: APIResponse;   // Underlying Playwright response for escape hatch scenarios
}
```

### Key Engineering Features
1. **Never Asserts**: Clients execute requests and return `ApiResponse<T>`. Negative and chaos tests assert against status codes and error payloads naturally.
2. **Timing Measurement**: `durationMs` measures elapsed time from socket dispatch to response resolution, facilitating latency SLA validation.
3. **Automated Header Management**:
   - `x-bypass-rate-limit: true`: Default on all calls to prevent test runner throttling.
   - `x-test-session-id`: Automatically propagated from the test worker for multi-tenant isolation.
   - `x-bypass-csrf: true`: Default for mutation calls unless overridden with `enforceCsrf: true`.
4. **Secret Redaction**: Request payloads and response logs automatically redact sensitive headers (`Authorization`, `Cookie`) and fields (`password`, `token`, `creditCard`).

---

## 3. Zod Schema Governance & Strictness Policy

All responses are validated against Zod schemas at runtime to prevent silent backend schema drift:

| Schema Scope | Validation Policy | Rationale |
| :--- | :--- | :--- |
| **Auth Payloads** (`auth.schema.ts`) | `.strict()` | Catches accidental credential or internal data leakage (such as `passwordHash`). |
| **Error Envelopes** (`error.schema.ts`) | `.strict()` | Enforces standardized `{ error, message?, correlationId?, errorName?, details? }` format. |
| **Domain Entities** (`book.schema.ts`, `cart.schema.ts`, etc.) | `.passthrough()` | Accommodates forward-compatible additive fields across backend deployments. |

### Derived TypeScript Types
To ensure single-source-of-truth consistency, domain types in `src/types/*.d.ts` derive directly from the Zod schemas using `z.infer`:

```typescript
import type { Book as SchemaBook } from '../api/schemas/book.schema';
export type Book = SchemaBook;
```

---

## 4. Custom Playwright Matchers

Sprint 8.1 registers three domain-specific matchers under Playwright's `expect`:

### `expect(res).toMatchSchema(schema)`
Validates that the response payload conforms to a Zod schema. If validation fails, it formats the first 3 failing property paths and codes with truncated payload dumps:

```typescript
const res = await api.books.list({ page: 1, limit: 10 });
await expect(res).toMatchSchema(PaginatedBooksSchema);
```

### `expect(res).toRespondWithin(maxDurationMs)`
Asserts that the HTTP round-trip completed within the defined SLA budget:

```typescript
const res = await api.system.health();
await expect(res).toRespondWithin(1000);
```

### `expect(res).toHaveStatus(expectedStatus)`
Asserts the exact HTTP status code with contextual error payload printing upon mismatch:

```typescript
const res = await api.auth.login({ username: 'invalid', password: 'bad' });
await expect(res).toHaveStatus(401);
```

---

## 5. Authoring Tests with the `api` Fixture

API tests import `test` and `expect` from `src/api/api.fixture`:

```typescript
import { test, expect } from '../../../api/api.fixture';
import { PaginatedBooksSchema } from '../../../api/schemas';

test('Fetch book catalog with pagination', async ({ api }) => {
  const response = await api.books.list({ page: 1, limit: 5 });

  await expect(response).toHaveStatus(200);
  await expect(response).toMatchSchema(PaginatedBooksSchema);
  await expect(response).toRespondWithin(3000);

  expect(response.body.books).toHaveLength(5);
});
```

### Multi-Tenant & Session Isolation
For tests simulating concurrent sessions or cross-tenant validation, use `createApiClient`:

```typescript
const requestA = await playwright.request.newContext({
  baseURL: envConfig.apiBaseUrl,
  extraHTTPHeaders: { 'x-test-session-id': 'session-a' }
});
const apiA = createApiClient(requestA);
const res = await apiA.cart.get();
```

---

## 6. Static Enforcement (ESLint Rule)

To prevent regression back to raw `request.*` calls, ESLint enforces `no-restricted-syntax` across `src/tests/api/**`:

```javascript
{
  files: ['src/tests/api/**/*.ts'],
  rules: {
    'no-restricted-syntax': [
      'error',
      {
        selector: "CallExpression[callee.object.name='request'][callee.property.name=/^(get|post|put|patch|delete)$/]",
        message: 'Direct request.<method> calls are forbidden in API tests. Use typed api.* clients instead.'
      }
    ]
  }
}
```
Any raw `request.get(...)` call in `src/tests/api/**` fails `npm run lint`.
