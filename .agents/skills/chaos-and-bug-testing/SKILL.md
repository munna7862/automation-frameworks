---
name: chaos-and-bug-testing
description: Guidelines and procedures for interacting with BuggyBooks chaos endpoints, configuring intentional failure modes, and handling UI/API anti-patterns in automated tests.
---

# Chaos & Bug Testing Skill

This skill outlines how to interact with BuggyBooks' intentional chaos features and anti-patterns during test development and QA validation against the remote staging environment:
- **Frontend Staging**: `https://buggy-books-fe.onrender.com`
- **Backend Staging**: `https://buggy-books.onrender.com/api`

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

| Anti-Pattern | Description | Cross-Framework Remediation Strategy |
| :--- | :--- | :--- |
| **Flaky Checkout** | `POST /api/checkout/process` intermittently returns `500 Internal Server Error` (~15% of the time). | Implement exponential backoff retry in API/UI flow; never remove the assertion. |
| **Dynamic UI Delays** | "Add to Cart" and checkout buttons simulate latency (500–3500ms). | Use native auto-waiting: Playwright `expect(locator).toHaveText()`, Selenium `until.elementIsEnabled()`, WDIO `waitForDisplayed()`. Forbid static sleeps (`waitForTimeout`). |
| **Obfuscated Locators** | Missing static IDs and `data-testid` attributes. | Use semantic ARIA queries (`getByRole`, `getByLabel`) or sanctioned **relative XPath with axes** (`//label[text()='Username']/following-sibling::input`). Absolute XPath is forbidden. |
| **Shadow DOM Encapsulation** | `<order-summary-box>` encapsulates price inside `#shadow-root`. | Playwright: native boundary piercing (`locator('order-summary-box').locator('.price')`).<br>Selenium: `getShadowRoot()` W3C API.<br>WebdriverIO: `$('order-summary-box').shadow$('.price')`. |
| **Visual Layout Chaos** | Shifting elements, mutated padding, and distorted banners when `visualChaos: true`. | Calibrate visual regression tests with `maxDiffPixelRatio: 0.05` and threshold filters. |
