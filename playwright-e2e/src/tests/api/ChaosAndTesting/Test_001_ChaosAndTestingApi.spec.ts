import { test, expect } from '../../../api/api.fixture';
import { CommonFunctions } from '@automationframeworks/playwright-utils';
import { randomBytes } from 'crypto';
import {
  AuthTokensResponseSchema,
  CartSchema,
  TestResetResponseSchema,
  TestConfigPostResponseSchema,
  ApiErrorResponseSchema,
  InventoryReportSchema
} from '../../../api/schemas';

const commonUtil = new CommonFunctions();

function uniqueUsername(prefix: string = 'chaosuser'): string {
  return `${prefix}_${Date.now()}_${randomBytes(4).toString('hex')}`;
}

test.describe('Chaos and Testing Utilities API', () => {
  test.beforeEach(async ({ api }) => {
    // Clean up state before each test in the isolated session
    const resetRes = await api.testControl.reset();
    await expect(resetRes).toHaveStatus(200);
    await expect(resetRes).toMatchSchema(TestResetResponseSchema);
  });

  test.afterEach(async ({ api }) => {
    // Reset chaos configuration back to baseline 0
    await api.testControl.setConfig({ checkoutFailureRate: 0, inventoryDelayMs: 0 });
    await api.testControl.reset();
  });

  test('API_TEST_01: Global reset clears all non-default users and carts @smoke @regression', async ({
    api
  }) => {
    const username = uniqueUsername();
    const password = 'Password123!';
    const fullName = 'Chaos Test User';

    // 1. Register a new user
    const registerRes = await api.auth.register({ username, password, fullName });
    await expect(registerRes).toHaveStatus(201);
    await expect(registerRes).toMatchSchema(AuthTokensResponseSchema);
    expect(registerRes.status).toBe(201);

    // 2. Login to get cookies
    const loginRes = await api.auth.login({ username, password });
    await expect(loginRes).toHaveStatus(200);
    await expect(loginRes).toMatchSchema(AuthTokensResponseSchema);
    expect(loginRes.status).toBe(200);

    // 3. Add book 3 to cart
    const addRes = await api.cart.add('3');
    await expect(addRes).toHaveStatus(200);
    await expect(addRes).toMatchSchema(CartSchema);
    expect(addRes.status).toBe(200);

    // 4. Perform Session Reset
    const resetRes = await api.testControl.reset();
    await expect(resetRes).toHaveStatus(200);
    await expect(resetRes).toMatchSchema(TestResetResponseSchema);
    expect(resetRes.status).toBe(200);

    // 5. Verify the registered user is cleared (Login should fail)
    const loginPostReset = await api.auth.login({ username, password });
    await expect(loginPostReset).toHaveStatus(401);
    await expect(loginPostReset).toMatchSchema(ApiErrorResponseSchema);
    expect(loginPostReset.status).toBe(401);

    // 6. Verify cart is cleared (Get Cart with default user should be empty)
    // Default user is testuser/buggybooks
    const defaultLoginRes = await api.auth.login({ username: 'testuser', password: 'buggybooks' });
    await expect(defaultLoginRes).toHaveStatus(200);
    await expect(defaultLoginRes).toMatchSchema(AuthTokensResponseSchema);
    expect(defaultLoginRes.status).toBe(200);

    const getCartRes = await api.cart.get();
    await expect(getCartRes).toHaveStatus(200);
    await expect(getCartRes).toMatchSchema(CartSchema);
    expect(getCartRes.status).toBe(200);
    const cartData = getCartRes.body;
    expect(cartData).toEqual([]);
  });

  test('API_CHAOS_01: Inject checkout failures @smoke @regression @chaos', async ({ api }) => {
    const username = uniqueUsername();
    const password = 'Password123!';
    const fullName = 'Chaos Checkout User';

    // 1. Register & Login
    const registerRes = await api.auth.register({ username, password, fullName });
    await expect(registerRes).toHaveStatus(201);
    await expect(registerRes).toMatchSchema(AuthTokensResponseSchema);
    expect(registerRes.status).toBe(201);

    const loginRes = await api.auth.login({ username, password });
    await expect(loginRes).toHaveStatus(200);
    await expect(loginRes).toMatchSchema(AuthTokensResponseSchema);
    expect(loginRes.status).toBe(200);

    // 2. Add book to cart
    const addRes = await api.cart.add('1');
    await expect(addRes).toHaveStatus(200);
    await expect(addRes).toMatchSchema(CartSchema);
    expect(addRes.status).toBe(200);

    // 3. Set checkout failure rate to 1.0 (always fail)
    const configRes = await api.testControl.setConfig({ checkoutFailureRate: 1.0 });
    await expect(configRes).toHaveStatus(200);
    await expect(configRes).toMatchSchema(TestConfigPostResponseSchema);
    expect(configRes.status).toBe(200);

    // 4. Try checkout and verify it returns 500
    const checkoutRes = await api.checkout.process({
      firstName: 'John',
      lastName: 'Doe',
      creditCard: '1234567890123456'
    });
    await expect(checkoutRes).toHaveStatus(500);
    await expect(checkoutRes).toMatchSchema(ApiErrorResponseSchema);
    expect(checkoutRes.status).toBe(500);
    const errData = checkoutRes.body as unknown as { error: string };
    expect(errData.error).toContain('Internal Server Error: Payment Gateway Timeout');
  });

  test('API_CHAOS_02: Inject API latency @smoke @regression @chaos', async ({ api }) => {
    // 1. Set inventory latency to 3000 ms
    const configRes = await api.testControl.setConfig({ inventoryDelayMs: 3000 });
    await expect(configRes).toHaveStatus(200);
    await expect(configRes).toMatchSchema(TestConfigPostResponseSchema);
    expect(configRes.status).toBe(200);

    // 2. Query inventory report and measure latency
    const response = await api.inventory.report();
    await expect(response).toHaveStatus(200);
    await expect(response).toMatchSchema(InventoryReportSchema);
    expect(response.status).toBe(200);

    const elapsedMs = response.durationMs;
    await commonUtil.logMessage('INFO', `Inventory report request took: ${elapsedMs} ms`);

    // We expect at least 3000ms delay, allowing a 100ms grace threshold
    expect(elapsedMs).toBeGreaterThanOrEqual(2900);
  });
});
