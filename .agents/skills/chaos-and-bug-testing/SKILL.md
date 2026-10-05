---
name: chaos-and-bug-testing
description: Guidelines and procedures for interacting with BuggyBooks chaos endpoints, configuring intentional failure modes, and handling UI/API anti-patterns in automated tests.
---

# Chaos & Bug Testing Skill

This skill outlines how to interact with BuggyBooks' intentional chaos features and anti-patterns during test development and QA validation against the remote staging environment:

- **Frontend Staging**: `https://buggy-books-fe.onrender.com`
- **Backend Staging**: `https://buggy-books.onrender.com/api`
- **Authoritative Manual**: Detailed failure signatures and code recipes across Playwright, Selenium, and WebdriverIO are in [`docs/intentional_bugs.md`](../../../docs/intentional_bugs.md).

---

## 1. Render Staging Latency & Mandatory Warm-Up

Render free-tier instances sleep after 15 minutes of inactivity (taking 30–60 seconds to spin up). Before executing tests that touch chaos endpoints or UI flows:

```bash
curl -s -o /dev/null https://buggy-books.onrender.com/api/books || true
curl -s -o /dev/null https://buggy-books-fe.onrender.com/ || true
npx wait-on -t 90000 https://buggy-books.onrender.com/api/books
npx wait-on -t 90000 https://buggy-books-fe.onrender.com/
```

---

## 2. Chaos Configuration & Reset Endpoints

### A. Dynamic Chaos Toggle (`POST /api/test/config`)

Enables or customizes artificial latency, error rates, and failure injections:

```json
{
  "checkoutFailureRate": 0.15,
  "inventoryDelayMs": 3000,
  "visualChaos": true,
  "rateLimitMaxRequests": 60
}
```

### B. Mandatory Reset Hook (`POST /api/test/reset`)

- **CRITICAL GOTCHA**: Chaos configurations mutate the **shared staging server** globally.
- **Rule**: Any test modifying chaos parameters **must** reset parameters in `test.afterEach` or `afterAll`:

```typescript
test.afterEach(async ({ request }) => {
  await request.post('/api/test/config', {
    data: { checkoutFailureRate: 0, inventoryDelayMs: 0, visualChaos: false }
  });
  await request.post('/api/test/reset');
});
```

### C. Test Session Sandboxing (`x-test-session-id`)

When testing concurrent order workflows or performance load, pass the `x-test-session-id` header to isolate cart data:

```http
x-test-session-id: test-session-${timestamp}
```

---

## 3. Intentional Anti-Patterns & Remediation Strategies

Consult [`docs/intentional_bugs.md`](../../../docs/intentional_bugs.md) for complete, runnable code recipes in Playwright, Selenium, and WebdriverIO:

| Anti-Pattern                 | Description                                                                                         | Cross-Framework Remediation Strategy                                                                                                                                                   |
| :--------------------------- | :-------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Flaky Checkout**           | `POST /api/checkout/process` intermittently returns `500 Internal Server Error` (~15% of the time). | Implement exponential backoff retry in API/UI flow; never remove the assertion.                                                                                                        |
| **Delayed Inventory Report** | `GET /api/inventory/report` artificially delayed by `inventoryDelayMs` (0-10000ms).                 | Calibrate per-request timeout thresholds (`timeout: 15000`) and SLA assertions.                                                                                                        |
| **Express Rate Limiting**    | Exceeding `rateLimitMaxRequests` yields `429 Too Many Requests`.                                    | Restrict parallel CI workers (`workers: 2`), respect `Retry-After` header, apply jitter.                                                                                               |
| **Session Cart State Leak**  | Shared carts between parallel workers cause race conditions.                                        | Sandbox with `x-test-session-id: <uuid>` request header across API/UI sessions.                                                                                                        |
| **Dynamic UI Delays**        | "Add to Cart" and checkout buttons simulate latency (500–3500ms).                                   | Use native auto-waiting: Playwright `expect(locator).toBeEnabled()`, Selenium `until.elementIsEnabled()`, WDIO `waitForClickable()`. Forbid static sleeps (`waitForTimeout`).          |
| **Obfuscated Locators**      | Missing static IDs and `data-testid` attributes.                                                    | Use semantic ARIA queries (`getByRole`, `getByLabel`) or sanctioned **relative XPath with axes** (`//label[text()='Username']/following-sibling::input`). Absolute XPath is forbidden. |
| **Shadow DOM Encapsulation** | `<order-summary-box>` encapsulates price inside `#shadow-root`.                                     | Playwright: native boundary piercing (`locator('order-summary-box .price')`).<br>Selenium: `getShadowRoot()` W3C API.<br>WebdriverIO: `$('order-summary-box').shadow$('.price')`.      |
| **Visual Layout Chaos**      | Shifting elements, mutated padding, and distorted banners when `visualChaos: true`.                 | Calibrate visual regression tests with `maxDiffPixelRatio: 0.05` and threshold filters.                                                                                                |
