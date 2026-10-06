import { test, expect } from '../../../core/base/api.fixture';
import { envConfig } from '../../../config/env.config';
import { CommonFunctions } from '@automationframeworks/playwright-utils';
import { KNOWN_BOOK_IDS } from '@automationframeworks/test-data';

const commonUtil = new CommonFunctions();

test.describe('Orders API Endpoint', () => {
  test('API_ORD_01: Authenticate user, complete checkout via API, and verify GET /api/orders history response @smoke @regression', async ({
    request,
    seed
  }) => {
    const apiBase = envConfig.apiBaseUrl;
    let authSession: any;

    await test.step('Register and authenticate new user session via API seeder', async () => {
      authSession = await seed.createAndLoginUser({ fullName: 'API Orders User' });
      expect(authSession.user.username).toBeTruthy();
    });

    await test.step('Add book to cart and process checkout via API seeder', async () => {
      const bookId = KNOWN_BOOK_IDS[1]; // Book '2'
      await seed.addToCart(authSession, bookId);

      const { order, response: checkoutRes } = await seed.placeOrder(authSession);
      expect(checkoutRes.status).toBe(200);
      expect(order.creditCard).toBeTruthy();
    });

    await test.step('Fetch GET /api/orders and verify orders list payload', async () => {
      const ordersRes = await request.get(`${apiBase}/api/orders`, {
        headers: authSession.headers
      });
      expect(ordersRes.status()).toBe(200);
      const orders = await ordersRes.json();
      expect(Array.isArray(orders)).toBe(true);
      expect(orders.length).toBeGreaterThan(0);
      await commonUtil.logMessage(
        'INFO',
        'Verifying GET /api/orders returns 200 OK and non-empty array of placed orders'
      );
    });
  });
});
