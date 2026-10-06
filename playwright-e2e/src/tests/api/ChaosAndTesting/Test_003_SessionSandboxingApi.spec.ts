import { test, expect } from '../../../api/api.fixture';
import { randomBytes } from 'crypto';
import { envConfig } from '../../../config/env.config';
import { createApiClient } from '../../../api/clients';
import {
  AuthTokensResponseSchema,
  CartSchema,
  ApiErrorResponseSchema,
  TestSessionDeleteResponseSchema
} from '../../../api/schemas';

test.describe('Session-Partitioned Data Sandboxing & Multi-Tenant Isolation', () => {
  test('API_SAN_01: Concurrent sessions maintain 100% data isolation for cart and user state @smoke @regression @sandboxing', async ({
    playwright
  }, testInfo) => {
    const testSessionId = `pw-w${testInfo.workerIndex}-${testInfo.parallelIndex}-${Date.now()}-${randomBytes(4).toString('hex')}`;
    const sessionA = `${testSessionId}-worker-a`;
    const sessionB = `${testSessionId}-worker-b`;

    const userA = `sandbox_user_a_${Date.now()}`;
    const userB = `sandbox_user_b_${Date.now()}`;
    const password = 'Password123!';

    // Create two isolated APIRequestContext instances representing concurrent tenants
    const requestA = await playwright.request.newContext({
      baseURL: envConfig.apiBaseUrl,
      extraHTTPHeaders: {
        'x-test-session-id': sessionA,
        'x-bypass-rate-limit': 'true'
      }
    });

    const requestB = await playwright.request.newContext({
      baseURL: envConfig.apiBaseUrl,
      extraHTTPHeaders: {
        'x-test-session-id': sessionB,
        'x-bypass-rate-limit': 'true'
      }
    });

    const apiA = createApiClient(requestA);
    const apiB = createApiClient(requestB);

    try {
      // 1. Register User A in Session A
      const regResA = await apiA.auth.register({
        username: userA,
        password,
        fullName: 'Sandbox User A'
      });
      await expect(regResA).toHaveStatus(201);
      await expect(regResA).toMatchSchema(AuthTokensResponseSchema);
      expect(regResA.status).toBe(201);

      // 2. Register User B in Session B
      const regResB = await apiB.auth.register({
        username: userB,
        password,
        fullName: 'Sandbox User B'
      });
      await expect(regResB).toHaveStatus(201);
      await expect(regResB).toMatchSchema(AuthTokensResponseSchema);
      expect(regResB.status).toBe(201);

      // 3. User A logs into Session A (cookies stored automatically in requestA)
      const loginResA = await apiA.auth.login({ username: userA, password });
      await expect(loginResA).toHaveStatus(200);
      await expect(loginResA).toMatchSchema(AuthTokensResponseSchema);
      expect(loginResA.status).toBe(200);

      // 4. User B logs into Session B (cookies stored automatically in requestB)
      const loginResB = await apiB.auth.login({ username: userB, password });
      await expect(loginResB).toHaveStatus(200);
      await expect(loginResB).toMatchSchema(AuthTokensResponseSchema);
      expect(loginResB.status).toBe(200);

      // 5. Add Book '1' to User A's Cart in Session A
      const addCartA = await apiA.cart.add('1');
      await expect(addCartA).toHaveStatus(200);
      await expect(addCartA).toMatchSchema(CartSchema);
      expect(addCartA.status).toBe(200);

      // 6. Add Book '2' to User B's Cart in Session B
      const addCartB = await apiB.cart.add('2');
      await expect(addCartB).toHaveStatus(200);
      await expect(addCartB).toMatchSchema(CartSchema);
      expect(addCartB.status).toBe(200);

      // 7. Verify User A only sees Book 1 in Session A
      const getCartA = await apiA.cart.get();
      await expect(getCartA).toHaveStatus(200);
      await expect(getCartA).toMatchSchema(CartSchema);
      expect(getCartA.status).toBe(200);
      const cartDataA = getCartA.body;
      expect(cartDataA).toHaveLength(1);
      expect(cartDataA[0].id).toBe('1');

      // 8. Verify User B only sees Book 2 in Session B
      const getCartB = await apiB.cart.get();
      await expect(getCartB).toHaveStatus(200);
      await expect(getCartB).toMatchSchema(CartSchema);
      expect(getCartB.status).toBe(200);
      const cartDataB = getCartB.body;
      expect(cartDataB).toHaveLength(1);
      expect(cartDataB[0].id).toBe('2');

      // 9. Verify User A cannot login in Session B (Zero tenant bleed)
      const crossLoginRes = await apiB.auth.login({ username: userA, password });
      await expect(crossLoginRes).toHaveStatus(401);
      await expect(crossLoginRes).toMatchSchema(ApiErrorResponseSchema);
      expect(crossLoginRes.status).toBe(401);

      // 10. Clean up Session A explicitly
      const delResA = await apiA.testControl.deleteSession(sessionA);
      await expect(delResA).toHaveStatus(200);
      await expect(delResA).toMatchSchema(TestSessionDeleteResponseSchema);
      expect(delResA.status).toBe(200);
      const delDataA = delResA.body;
      expect(delDataA.success).toBe(true);

      // 11. Clean up Session B explicitly
      const delResB = await apiB.testControl.deleteSession(sessionB);
      await expect(delResB).toHaveStatus(200);
      await expect(delResB).toMatchSchema(TestSessionDeleteResponseSchema);
      expect(delResB.status).toBe(200);
      const delDataB = delResB.body;
      expect(delDataB.success).toBe(true);
    } finally {
      await requestA.dispose();
      await requestB.dispose();
    }
  });
});
