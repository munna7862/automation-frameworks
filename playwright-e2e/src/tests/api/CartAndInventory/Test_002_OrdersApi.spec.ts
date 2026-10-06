import { test, expect } from '../../../api/api.fixture';
import { CommonFunctions } from '@automationframeworks/playwright-utils';
import { KNOWN_BOOK_IDS } from '@automationframeworks/test-data';
import { OrdersListSchema } from '../../../api/schemas';

const commonUtil = new CommonFunctions();

test.describe('Orders API Endpoint', () => {
  test('API_ORD_01: Authenticate user, complete checkout via API, and verify GET /api/orders history response @smoke @regression', async ({
    api,
    seed
  }) => {
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
      const ordersRes = await api.orders.list({
        headers: authSession.headers
      });
      await expect(ordersRes).toHaveStatus(200);
      await expect(ordersRes).toMatchSchema(OrdersListSchema);
      expect(ordersRes.status).toBe(200);
      const orders = ordersRes.body;
      expect(Array.isArray(orders)).toBe(true);
      expect(orders.length).toBeGreaterThan(0);
      await commonUtil.logMessage(
        'INFO',
        'Verifying GET /api/orders returns 200 OK and non-empty array of placed orders'
      );
    });
  });
});
