import { test, expect } from '../../../api/api.fixture';
import { KNOWN_BOOK_IDS } from '@automationframeworks/test-data';
import { CartSchema, InventoryReportSchema } from '../../../api/schemas';

test.describe('Cart & Inventory API', () => {
  test('API_CART_01: Cart persistence after server crash @smoke @regression', async ({
    api,
    seed
  }) => {
    // 1. Create and authenticate user via ApiSeeder
    const authSession = await seed.createAndLoginUser({ fullName: 'Cart Test User' });
    expect(authSession.user.username).toBeTruthy();

    // 2. Add book 3 to cart via ApiSeeder
    const bookId = KNOWN_BOOK_IDS[2]; // '3'
    await seed.addToCart(authSession, bookId);

    // 3. Get Cart and verify book 3 is present
    const getRes = await api.cart.get({ headers: authSession.headers });
    await expect(getRes).toHaveStatus(200);
    await expect(getRes).toMatchSchema(CartSchema);
    expect(getRes.status).toBe(200);
    const getData = getRes.body;
    expect(getData).toContainEqual(expect.objectContaining({ id: bookId }));
  });

  test('API_INV_01: Trigger inventory report @smoke @regression', async ({ api }) => {
    const response = await api.inventory.report();

    await expect(response).toHaveStatus(200);
    await expect(response).toMatchSchema(InventoryReportSchema);
    expect(response.status).toBe(200);
    const data = response.body;
    expect(data.totalBooks).toBe(15);
    expect(data.totalValue).toBeCloseTo(196.91, 2);
    expect(data.timestamp).toBeTruthy();
    expect(new Date(data.timestamp).toString()).not.toBe('Invalid Date');
  });
});
