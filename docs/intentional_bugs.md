# BuggyBooks Intentional Anti-Patterns & Chaos Engineering Guide

This document is the authoritative engineering manual for all intentional bugs, artificial latency anti-patterns, and chaos engineering knobs embedded within the **BuggyBooks** application ([Frontend](https://buggy-books-fe.onrender.com) | [Backend](https://buggy-books.onrender.com/api)).

It serves as the definitive reference for SDETs, QA automation specialists, and AI coding agents writing tests in **Playwright**, **Selenium WebDriver**, or **WebdriverIO**. Adhering to these patterns prevents test flakiness, eliminates false positives, and protects the shared staging environment from persistent state contamination.

---

## 🧭 Navigation & Document Map

- [1. Core Principles & Chaos Philosophy](#1-core-principles--chaos-philosophy)
- [2. Chaos Control Center & Endpoint Architecture](#2-chaos-control-center--endpoint-architecture)
- [3. Backend & API Anti-Patterns](#3-backend--api-anti-patterns)
  - [3.1 Intermittent Checkout Failure (`checkoutFailureRate`)](#31-intermittent-checkout-failure-checkoutfailurerate)
  - [3.2 Delayed Inventory Report (`inventoryDelayMs`)](#32-delayed-inventory-report-inventorydelayms)
  - [3.3 Express Rate Limiting (`429 Too Many Requests`)](#33-express-rate-limiting-429-too-many-requests)
  - [3.4 Session Sandboxing (`x-test-session-id`)](#34-session-sandboxing-x-test-session-id)
  - [3.5 CSRF Bypass via Rate-Limit Header (`x-bypass-rate-limit`)](#35-csrf-bypass-via-rate-limit-header-x-bypass-rate-limit)
- [4. Frontend & UI Anti-Patterns](#4-frontend--ui-anti-patterns)
  - [4.1 Dynamic Actionability Delay (500–3500ms Button Latency)](#41-dynamic-actionability-delay-5003500ms-button-latency)
  - [4.2 Obfuscated Locators & Missing `data-testid` Attributes](#42-obfuscated-locators--missing-data-testid-attributes)
  - [4.3 Shadow DOM Encapsulation (`<order-summary-box>`)](#43-shadow-dom-encapsulation-order-summary-box)
  - [4.4 Visual Layout Chaos (`visualChaos: true`)](#44-visual-layout-chaos-visualchaos-true)
- [5. Mandatory Teardown Reset Protocols](#5-mandatory-teardown-reset-protocols)
- [6. Cross-Framework Remediation Matrix](#6-cross-framework-remediation-matrix)
- [7. Governance & Link Integrity](#7-governance--link-integrity)

---

## 1. Core Principles & Chaos Philosophy

Modern enterprise applications do not fail simply because logic is incorrect; they fail due to network partitions, third-party gateway timeouts, DOM hydration delays, rate limits, and asynchronous race conditions. BuggyBooks intentionally simulates these real-world conditions.

> [!IMPORTANT]
> **The Golden Rule of Chaos Testing**:
> Chaos parameters mutate the **globally shared staging server**. Any test that modifies chaos configuration (`POST /api/test/config`) or creates test state **must restore default settings and execute a full reset (`POST /api/test/reset`) in its teardown hook** (`afterEach` or `afterAll`).

### Anti-Pattern Governance Rules:
1. **Never Disable Assertions**: Never delete an assertion or weaken test thresholds to "make a test pass" against chaos. Remediate with robust architectural waiting, retries, and error handling.
2. **Zero Blind Timeouts**: Arbitrary sleeps (e.g. `page.waitForTimeout(5000)`, `Thread.sleep(5000)`, `browser.pause(5000)`) are strictly forbidden. Use condition-based auto-waiting.
3. **Isolate Concurrent State**: Use `x-test-session-id` headers for API/UI interactions to avoid contaminating cart and checkout state across parallel test workers.

---

## 2. Chaos Control Center & Endpoint Architecture

BuggyBooks provides administrative endpoints specifically designed for automated test suites to manipulate and reset application state:

### A. Dynamic Configuration (`POST /api/test/config`)
Applies transient chaos knobs and operational behavior to the staging server.

- **Endpoint**: `POST /api/test/config`
- **Content-Type**: `application/json`
- **Supported Knobs**:

| Parameter | Type | Default | Description |
| :--- | :--- | :---: | :--- |
| `checkoutFailureRate` | `number` (0.0 to 1.0) | `0.0` | Probability of simulated 500 Payment Gateway Timeout on checkout. |
| `inventoryDelayMs` | `number` (ms) | `0` | Artificial server response delay injected into `/api/inventory/report`. |
| `visualChaos` | `boolean` | `false` | Distorts UI layouts, banner shifts, and CSS margins for visual testing. |
| `rateLimitMaxRequests` | `number` | `60` | Maximum requests permitted within a 1-minute window per IP. |

**Example Request**:
```bash
curl -X POST https://buggy-books.onrender.com/api/test/config \
  -H "Content-Type: application/json" \
  -d '{"checkoutFailureRate": 0.5, "inventoryDelayMs": 2000, "visualChaos": true}'
```

### B. Configuration Query (`GET /api/test/config`)
Retrieves the currently active configuration values.

- **Endpoint**: `GET /api/test/config`
- **Response**: `200 OK`
```json
{
  "checkoutFailureRate": 0,
  "inventoryDelayMs": 0,
  "visualChaos": false,
  "rateLimitMaxRequests": 60
}
```

### C. Global State Reset (`POST /api/test/reset`)
Restores the BuggyBooks database and server state to clean seed data. Clears transient user registrations, empties all shopping carts, resets chaos knobs to defaults, and flushes session caches.

- **Endpoint**: `POST /api/test/reset`
- **Response**: `200 OK`
```json
{
  "message": "Test state and database successfully reset to seed defaults."
}
```

---

## 3. Backend & API Anti-Patterns

### 3.1 Intermittent Checkout Failure (`checkoutFailureRate`)

#### Failure Signature
- **Target Endpoint**: `POST /api/checkout/process`
- **Error Response**: `500 Internal Server Error`
```json
{
  "error": "Internal Server Error: Payment Gateway Timeout (Simulated Chaos)"
}
```
- **Symptom**: When `checkoutFailureRate` is greater than `0.0`, checkout attempts randomly fail with HTTP 500. Under high load or chaos testing, naive test suites fail with unhandled server exceptions.

#### Remediation Strategy
Implement an **exponential backoff retry wrapper** around checkout requests. Do not disable or remove the order confirmation assertion.

#### Remediation Recipes

##### Playwright (TypeScript)
```typescript
import { APIRequestContext, expect } from '@playwright/test';

export async function processCheckoutWithRetry(
  request: APIRequestContext,
  payload: { firstName: string; lastName: string; creditCard: string },
  maxRetries: number = 3
) {
  let attempt = 0;
  let delayMs = 500;

  while (attempt < maxRetries) {
    attempt++;
    const res = await request.post('/api/checkout/process', { data: payload });

    if (res.status() === 200) {
      const data = await res.json();
      expect(data).toHaveProperty('orderId');
      return data;
    }

    if (res.status() === 500 && attempt < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
      delayMs *= 2; // exponential backoff
      continue;
    }

    throw new Error(`Checkout failed after ${attempt} attempts with HTTP status ${res.status()}: ${await res.text()}`);
  }
}
```

##### Selenium WebDriver (TypeScript)
```typescript
import { WebDriver, By, until } from 'selenium-webdriver';

export async function submitCheckoutWithRetry(driver: WebDriver, maxRetries: number = 3) {
  const checkoutBtn = By.xpath("//button[contains(text(), 'Complete Order')]");
  const successBanner = By.css('.order-confirmation-message');
  const errorToast = By.css('.toast-error');

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const btn = await driver.wait(until.elementLocated(checkoutBtn), 5000);
    await driver.wait(until.elementIsEnabled(btn), 5000);
    await btn.click();

    try {
      // Check for success banner
      await driver.wait(until.elementLocated(successBanner), 4000);
      return; // Order completed successfully
    } catch {
      // Check if simulated 500 error toast appeared
      const hasError = await driver.findElements(errorToast);
      if (hasError.length > 0 && attempt < maxRetries) {
        await driver.sleep(attempt * 1000); // Backoff wait
        continue;
      }
      throw new Error(`Checkout failed after ${attempt} attempts.`);
    }
  }
}
```

##### WebdriverIO (TypeScript)
```typescript
export async function submitCheckoutWithRetry(maxRetries: number = 3) {
  const checkoutBtn = $('//button[contains(text(), "Complete Order")]');
  const confirmation = $('.order-confirmation-message');

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    await checkoutBtn.waitForClickable({ timeout: 5000 });
    await checkoutBtn.click();

    const isSuccess = await confirmation.waitForExist({ timeout: 4000, reverse: false }).catch(() => false);
    if (isSuccess) {
      return;
    }

    if (attempt === maxRetries) {
      throw new Error(`Checkout failed after ${maxRetries} retry attempts.`);
    }
    await browser.pause(attempt * 1000);
  }
}
```

---

### 3.2 Delayed Inventory Report (`inventoryDelayMs`)

#### Failure Signature
- **Target Endpoint**: `GET /api/inventory/report`
- **Symptom**: The endpoint deliberately delays its response by `inventoryDelayMs` (up to 10,000ms). Default test runner timeouts (3,000ms to 5,000ms) will abort the request with `TimeoutError: Request exceeded timeout`.

#### Remediation Strategy
Configure explicit request-level timeouts or calibrate SLA assertions based on expected delay thresholds.

#### Remediation Recipes

##### Playwright (TypeScript)
```typescript
import { test, expect } from '@playwright/test';

test('Handle delayed inventory report with calibrated timeout', async ({ request }) => {
  const configuredDelayMs = 3000;
  const timeoutAllowanceMs = configuredDelayMs + 5000; // Delay + network buffer

  const startTime = Date.now();
  const response = await request.get('/api/inventory/report', {
    timeout: timeoutAllowanceMs
  });

  const duration = Date.now() - startTime;
  expect(response.status()).toBe(200);
  expect(duration).toBeGreaterThanOrEqual(configuredDelayMs - 200); // Grace tolerance
});
```

##### Selenium WebDriver (TypeScript)
```typescript
import { WebDriver, until, By } from 'selenium-webdriver';

export async function waitForInventoryReportTable(driver: WebDriver, expectedDelayMs: number = 3000) {
  // Calibrate explicit wait for inventory table to accommodate artificial delay
  const inventoryTable = By.css('[data-testid="inventory-table"]');
  const timeoutMs = expectedDelayMs + 6000;

  return await driver.wait(until.elementLocated(inventoryTable), timeoutMs, 
    `Inventory table failed to load within ${timeoutMs}ms.`);
}
```

##### WebdriverIO (TypeScript)
```typescript
export async function waitForInventoryData(expectedDelayMs: number = 3000) {
  const inventoryContainer = $('[data-testid="inventory-table"]');
  await inventoryContainer.waitForDisplayed({
    timeout: expectedDelayMs + 6000,
    timeoutMsg: `Inventory data did not render within expected delay window.`
  });
}
```

---

### 3.3 Express Rate Limiting (`429 Too Many Requests`)

#### Failure Signature
- **Target Endpoints**: `GET /api/books`, `POST /api/login`, `POST /api/checkout/process`
- **Status Code**: `429 Too Many Requests`
- **Headers Returned**: `Retry-After: 60`, `RateLimit-Limit: 60`, `RateLimit-Remaining: 0`
- **Body**:
```json
{
  "error": "Too many requests from this IP, please try again after 60 seconds."
}
```
- **Symptom**: When running parallel test workers or load suites, requests burst beyond Express `express-rate-limit` thresholds, resulting in sudden HTTP 429 cascades.

#### Remediation Strategy
1. **Parallel Worker Throttling**: Restrict concurrent UI/API test workers targeting staging (e.g. `workers: 2` or `workers: 3` in CI).
2. **Jittered Exponential Backoff**: Catch HTTP 429 in API clients and read the `Retry-After` header.

#### Remediation Recipes

##### Playwright API Helper (TypeScript)
```typescript
import { APIRequestContext, APIResponse } from '@playwright/test';

export async function requestWithRateLimitRetry(
  request: APIRequestContext,
  url: string,
  options: any = {},
  maxRetries: number = 3
): Promise<APIResponse> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const response = await request.fetch(url, options);

    if (response.status() !== 429) {
      return response;
    }

    const retryAfterHeader = response.headers()['retry-after'];
    const waitSeconds = retryAfterHeader ? parseInt(retryAfterHeader, 10) : (attempt * 2);
    const jitterMs = Math.floor(Math.random() * 500);

    console.warn(`[RateLimit] 429 received on ${url}. Retrying in ${waitSeconds}s + ${jitterMs}ms jitter...`);
    await new Promise(res => setTimeout(res, (waitSeconds * 1000) + jitterMs));
  }

  throw new Error(`Rate limit exceeded on ${url} after ${maxRetries} retries.`);
}
```

---

### 3.4 Session Sandboxing (`x-test-session-id`)

#### Failure Signature
- **Symptom**: Multiple automated test runs executing in parallel share the default session cart and user state. Cart items added in Test A pollute assertions in Test B.

#### Remediation Strategy
Inject the `x-test-session-id: <uuid>` header on all requests to sandbox test cart, orders, and user context.

#### Remediation Recipes

##### Playwright Context Fixture (TypeScript)
```typescript
import { test as base, request } from '@playwright/test';
import { randomUUID } from 'crypto';

export const test = base.extend<{ testSessionId: string }>({
  testSessionId: async ({}, use) => {
    const sessionId = `session-${Date.now()}-${randomUUID().slice(0, 8)}`;
    await use(sessionId);
  },
  request: async ({ testSessionId }, use) => {
    const context = await request.newContext({
      extraHTTPHeaders: {
        'x-test-session-id': testSessionId
      }
    });
    await use(context);
    await context.dispose();
  }
});
```

##### WebdriverIO Custom Headers Hook (TypeScript)
```typescript
// wdio.conf.ts
import { v4 as uuidv4 } from 'uuid';

export const config: WebdriverIO.Config = {
  beforeSuite: function () {
    const sessionId = `wdio-${Date.now()}-${uuidv4().substring(0, 6)}`;
    browser.sharedSessionId = sessionId;
  },
  // In API interactions or fetch injections:
  // headers: { 'x-test-session-id': browser.sharedSessionId }
};
```

---

### 3.5 CSRF Bypass via Rate-Limit Header (`x-bypass-rate-limit`)

#### Failure Signature
- **Target Endpoints**: State-changing endpoints (`POST /api/cart`, `POST /api/checkout/process`, `POST /api/profile/upload`)
- **Status Code**: `200 OK` (when `403 Forbidden` was expected)
- **Symptom**: In `buggy-books/backend/src/app.ts`, double-submit CSRF verification (`csrf-csrf`) is bypassed when either `x-bypass-csrf: true` **or** `x-bypass-rate-limit: true` is present on the incoming request.
- **Security Finding**: When automated test suites send `x-bypass-rate-limit: true` without `x-enforce-csrf: true`, state mutations succeed even when the client provides no CSRF token or cookie. This behavior masks missing CSRF controls in testing.

#### Remediation Strategy
1. **Use `securityApi` Fixture**: For AppSec test specs, use `securityApi` which strictly omits both `x-bypass-rate-limit` and `x-bypass-csrf`.
2. **Explicit CSRF Enforcement**: Pass `x-enforce-csrf: true` along with tokens acquired from `GET /api/csrf-token` to prove that CSRF double-submit protection works as designed.
3. **Traceability**: Tested and documented via `SEC-CSRF-01`, `SEC-CSRF-02`, and `SEC-CSRF-03` in `Test_007_CsrfEnforcement.spec.ts`.

---

## 4. Frontend & UI Anti-Patterns

### 4.1 Dynamic Actionability Delay (500–3500ms Button Latency)

#### Failure Signature
- **Target UI Controls**: "Add to Cart", "Proceed to Checkout", "Place Order" buttons.
- **Symptom**: After clicking, buttons enter a disabled state (`disabled` attribute added, or `pointer-events: none; opacity: 0.6;`) for 500ms to 3500ms to simulate asynchronous validation, payment processing, or debounce protection.
- Brittle tests that immediately click or check element text fail with `ElementClickInterceptedException` or assert against stale button state.

#### Remediation Strategy
Leverage framework auto-waiting on actionability (`toBeEnabled()`, `toBeVisible()`). Forbid static sleeps (`waitForTimeout`).

#### Remediation Recipes

##### Playwright (TypeScript)
```typescript
import { Locator, expect } from '@playwright/test';

export async function clickAddToCartWithAutoWait(addToCartBtn: Locator) {
  // Playwright automatically waits for visible + enabled + stable actionability checks
  await expect(addToCartBtn).toBeVisible({ timeout: 5000 });
  await expect(addToCartBtn).toBeEnabled({ timeout: 5000 });
  await addToCartBtn.click();

  // Wait for post-click debounced state to clear or toast to display
  await expect(addToCartBtn).not.toHaveClass(/is-loading/, { timeout: 6000 });
}
```

##### Selenium WebDriver (TypeScript)
```typescript
import { WebDriver, By, until } from 'selenium-webdriver';

export async function clickActionableButton(driver: WebDriver, locator: By, timeoutMs: number = 6000) {
  const element = await driver.wait(until.elementLocated(locator), timeoutMs);
  await driver.wait(until.elementIsVisible(element), timeoutMs);
  await driver.wait(until.elementIsEnabled(element), timeoutMs);
  await element.click();
}
```

##### WebdriverIO (TypeScript)
```typescript
export async function clickActionableButton(element: ChainablePromiseElement) {
  await element.waitForDisplayed({ timeout: 6000 });
  await element.waitForEnabled({ timeout: 6000 });
  await element.waitForClickable({ timeout: 6000 });
  await element.click();
}
```

---

### 4.2 Obfuscated Locators & Missing `data-testid` Attributes

#### Failure Signature
- **Symptom**: Form fields and buttons in BuggyBooks often lack static HTML IDs or standard `data-testid` attributes (e.g. `id="btn_x89a_submit"` changes on each build).
- Tests using hardcoded brittle XPaths (e.g. `/html/body/div[1]/main/div[2]/form/div[3]/button`) break immediately when minor DOM structure updates occur.

#### Remediation Strategy
1. **Playwright Priority**: Use semantic ARIA queries (`getByRole`, `getByLabel`, `getByPlaceholder`).
2. **Selenium / WDIO Priority**: Use stable **relative XPath with axes** based on label text or surrounding landmarks. Absolute XPaths are strictly forbidden.

#### Remediation Recipes

| Target Element | Brittle Anti-Pattern (FORBIDDEN) | Resilient Locator Recipe (MANDATED) |
| :--- | :--- | :--- |
| **Username Input** | `/html/body/div[1]/form/div[1]/input` | **Playwright**: `page.getByLabel('Username')`<br>**Selenium**: `By.xpath("//label[normalize-space()='Username']/following-sibling::input")`<br>**WDIO**: `$('label*=Username').$('..').$('input')` |
| **Submit Button** | `//*[@id="btn-login-dynamic-9182"]` | **Playwright**: `page.getByRole('button', { name: /log in/i })`<br>**Selenium**: `By.xpath("//button[contains(normalize-space(),'Log In')]")`<br>**WDIO**: `$('button=Log In')` |
| **Book Card Add Button** | `div.book-card:nth-child(2) > div > button` | **Playwright**: `page.locator('.book-card').filter({ hasText: 'Clean Code' }).getByRole('button', { name: /add to cart/i })`<br>**Selenium**: `By.xpath("//div[contains(@class,'book-card')][.//h3[text()='Clean Code']]//button[contains(.,'Add')]")` |

---

### 4.3 Shadow DOM Encapsulation (`<order-summary-box>`)

#### Failure Signature
- **Target Web Component**: `<order-summary-box>`
- **Internal Structure**:
```html
<order-summary-box>
  #shadow-root (open)
    <div class="summary-container" role="region" aria-label="Order Summary">
      <span class="subtotal">$49.99</span>
      <span class="tax">$4.50</span>
      <span class="summary-total">$54.49</span>
    </div>
</order-summary-box>
```
- **Symptom**: Standard CSS queries (`document.querySelector('.summary-total')`) or traditional XPaths fail to penetrate the `#shadow-root` boundary, throwing element not found errors.

#### Remediation Strategy
Use framework-native Shadow DOM piercing mechanisms.

#### Remediation Recipes

##### Playwright (Native Shadow Piercing)
Playwright penetrates open shadow DOM boundaries automatically with standard CSS/text selectors:
```typescript
import { Page, expect } from '@playwright/test';

export async function verifyOrderSummaryTotal(page: Page, expectedTotal: string) {
  // Playwright transparently crosses #shadow-root boundaries!
  const totalLocator = page.locator('order-summary-box .summary-total');
  await expect(totalLocator).toBeVisible();
  await expect(totalLocator).toHaveText(expectedTotal);
}
```

##### Selenium WebDriver (W3C `getShadowRoot` API)
```typescript
import { WebDriver, By, until } from 'selenium-webdriver';

export async function getOrderSummaryTotal(driver: WebDriver): Promise<string> {
  // 1. Locate shadow host element
  const host = await driver.wait(until.elementLocated(By.css('order-summary-box')), 5000);
  
  // 2. Access shadow root via W3C ShadowRoot API
  const shadowRoot = await host.getShadowRoot();
  
  // 3. Query elements within the shadow root
  const totalElement = await shadowRoot.findElement(By.css('.summary-total'));
  return await totalElement.getText();
}
```

##### WebdriverIO (Shadow Element Selector)
```typescript
export async function getOrderSummaryTotal(): Promise<string> {
  // WebdriverIO provides the .shadow$ selector helper
  const shadowTotal = $('order-summary-box').shadow$('.summary-total');
  await shadowTotal.waitForDisplayed({ timeout: 5000 });
  return await shadowTotal.getText();
}
```

---

### 4.4 Visual Layout Chaos (`visualChaos: true`)

#### Failure Signature
- **Trigger**: `POST /api/test/config` `{ "visualChaos": true }`
- **Symptom**: Dynamic margin shifting, distorted hero image banners, randomized button padding, and swapped palette colors.
- Pixel-by-pixel visual regression tools fail immediately with huge diff percentages unless properly calibrated.

#### Remediation Strategy
1. **Calibrate Diff Tolerance**: Permit acceptable threshold drift (`maxDiffPixelRatio: 0.05`).
2. **Mask Volatile Regions**: Mask dynamic promotional banners and chaos-injected components.
3. **Dedicated Chaos Specs**: Separate clean visual regression specs (`visualChaos: false`) from chaos tolerance specs (`visualChaos: true`).

#### Remediation Recipes

##### Playwright Visual Regression
```typescript
import { test, expect } from '@playwright/test';

test('Visual regression test resilient to intentional visual chaos', async ({ page }) => {
  await page.goto('/catalog');
  await page.waitForLoadState('networkidle');

  // Mask dynamic banner and apply calibrated mismatch ratio
  await expect(page).toHaveScreenshot('catalog-chaos-tolerant.png', {
    maxDiffPixelRatio: 0.05, // Allow up to 5% pixel delta under chaos
    threshold: 0.2,          // Color tolerance per pixel
    mask: [
      page.locator('.dynamic-promo-banner'),
      page.locator('.chaos-indicator-badge')
    ]
  });
});
```

##### WebdriverIO Visual Service
```typescript
it('should validate layout with visual chaos tolerance', async () => {
  await browser.url('/catalog');

  const result = await browser.checkScreen('catalog-chaos', {
    misMatchTolerance: 5.0, // 5% diff allowance
    hideElements: [
      $('.dynamic-promo-banner')
    ]
  });

  expect(result).toBeLessThanOrEqual(5.0);
});
```

---

## 5. Mandatory Teardown Reset Protocols

> [!CAUTION]
> Failing to execute `POST /api/test/reset` leaves mutated chaos knobs active on the remote staging server. This corrupts concurrent test runs, causes CI PR quality gates to fail intermittently, and triggers spurious alerts.

### Non-Negotiable Teardown Pattern (Every Spec File)

#### Playwright Setup & Teardown
```typescript
import { test } from '@playwright/test';

test.describe('Resilience and Chaos Test Suite', () => {

  // Optional: Ensure clean baseline before test starts
  test.beforeEach(async ({ request }) => {
    const resetRes = await request.post('/api/test/reset');
    if (!resetRes.ok()) {
      throw new Error(`Pre-test state reset failed with status ${resetRes.status()}`);
    }
  });

  // MANDATORY: Restore chaos config and reset application state
  test.afterEach(async ({ request }) => {
    try {
      await request.post('/api/test/config', {
        data: {
          checkoutFailureRate: 0,
          inventoryDelayMs: 0,
          visualChaos: false,
          rateLimitMaxRequests: 60
        }
      });
    } finally {
      await request.post('/api/test/reset');
    }
  });

  // Tests go here...
});
```

#### Selenium / Mocha Teardown
```typescript
import axios from 'axios';

afterEach(async function () {
  const apiBaseUrl = process.env.API_BASE_URL || 'https://buggy-books.onrender.com';
  try {
    await axios.post(`${apiBaseUrl}/api/test/config`, {
      checkoutFailureRate: 0,
      inventoryDelayMs: 0,
      visualChaos: false
    });
  } catch (err) {
    console.error('Failed to reset test config:', err);
  } finally {
    await axios.post(`${apiBaseUrl}/api/test/reset`);
  }
});
```

---

## 6. Cross-Framework Remediation Matrix

| Anti-Pattern | Playwright Strategy | Selenium WebDriver Strategy | WebdriverIO Strategy |
| :--- | :--- | :--- | :--- |
| **Intermittent Checkout 500** | Exponential backoff retry loop with `request.post` | `driver.wait(until.elementLocated(...))` in retry loop | `waitForExist()` retry loop with exponential backoff |
| **Delayed Inventory Report** | Calibrated per-request `timeout: 15000` | `driver.wait(until.elementLocated(...), timeout)` | `waitForDisplayed({ timeout })` |
| **Rate Limiting 429** | Worker concurrency limits + `Retry-After` retry wrapper | Throttled test runner threads + request backoff | Throttled test instances + jittered retry delay |
| **Session Cart State Leak** | `x-test-session-id` header in `request.newContext()` | Unique session headers via HTTP proxy / cookies | Shared session ID in `beforeSuite` hooks |
| **Button Actionability Delay** | Native auto-waiting (`expect(btn).toBeEnabled()`) | `until.elementIsEnabled(element)` explicit wait | `btn.waitForClickable({ timeout })` |
| **Obfuscated / No TestID** | Semantic ARIA queries (`getByRole`, `getByLabel`) | Relative XPath with axes (`//label/following-sibling::input`) | Semantic ARIA / text selectors (`$('button=Text')`) |
| **Shadow DOM Encapsulation** | Native piercing CSS (`order-summary-box .price`) | W3C `getShadowRoot()` API traversal | `.shadow$()` selector helper |
| **Visual Layout Chaos** | `toHaveScreenshot({ maxDiffPixelRatio: 0.05, mask: [...] })` | Pixel tolerance threshold + region masking | `checkScreen({ misMatchTolerance: 5.0, hideElements: [...] })` |
| **Shared State Mutation** | Mandatory `POST /api/test/reset` in `test.afterEach` | Mandatory `POST /api/test/reset` in `afterEach` hook | Mandatory `POST /api/test/reset` in `afterEach` hook |

---

## 7. Governance & Link Integrity

1. **Dual-Catalog Parity**: Any new test scenario designed to validate chaos anti-patterns must be registered in both catalogs in character-for-character lockstep:
   - [`docs/test_cases_catalog.md`](test_cases_catalog.md)
   - [`playwright-e2e/test_cases_catalog.md`](../playwright-e2e/test_cases_catalog.md)
2. **Skill Synchronization**: Operational guidelines in this manual must remain synchronized with:
   - [`.agents/skills/chaos-and-bug-testing/SKILL.md`](../.agents/skills/chaos-and-bug-testing/SKILL.md)
   - [`AGENTS.md`](../AGENTS.md)
3. **Cross-Platform Portability**: Never introduce Windows-specific local file paths (`file:///c:/...`). Always use relative markdown links.
