import { test, expect } from '../../../core/base/api.fixture';
import { KNOWN_BOOK_IDS } from '@automationframeworks/test-data';

test.describe('Cart & Inventory API', () => {
  test('API_CART_01: Cart persistence after server crash @smoke @regression', async ({
    request,
    seed
  }) => {
    // 1. Create and authenticate user via ApiSeeder
    const authSession = await seed.createAndLoginUser({ fullName: 'Cart Test User' });
    expect(authSession.user.username).toBeTruthy();

    // 2. Add book 3 to cart via ApiSeeder
    const bookId = KNOWN_BOOK_IDS[2]; // '3'
    await seed.addToCart(authSession, bookId);

    // 3. Get Cart and verify book 3 is present
    const getRes = await request.get('/api/cart', { headers: authSession.headers });
    expect(getRes.status()).toBe(200);
    const getData = await getRes.json();
    expect(getData).toContainEqual(expect.objectContaining({ id: bookId }));
  });

  test('API_INV_01: Trigger inventory report @smoke @regression', async ({ request }) => {
    const response = await request.get('/api/inventory/report');

    expect(response.status()).toBe(200);
    const data = (await response.json()) as {
      totalBooks: number;
      totalValue: number;
      timestamp: string;
    };
    expect(data.totalBooks).toBe(15);
    expect(data.totalValue).toBeCloseTo(196.91, 2);
    expect(data.timestamp).toBeTruthy();
    expect(new Date(data.timestamp).toString()).not.toBe('Invalid Date');
  });
});
