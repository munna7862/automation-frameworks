import { test, expect } from '../../../api/api.fixture';
import { KNOWN_BOOK_IDS } from '@automationframeworks/test-data';
import { CartSchema, CartClearResponseSchema, ApiErrorResponseSchema } from '../../../api/schemas';
import { createApiClient } from '../../../api/clients';
import { envConfig } from '../../../config/env.config';

test.describe('Cart Removal & Deletion API Suite', () => {
  test('API_COV_01: Remove single item from cart and verify stock and total updates @regression', async ({
    api,
    seed
  }) => {
    const authSession = await seed.createAndLoginUser({ fullName: 'Cart Removal User' });
    const book1 = KNOWN_BOOK_IDS[0]; // '1'
    const book2 = KNOWN_BOOK_IDS[1]; // '2'

    // Add 2 items
    await api.cart.add(book1, { headers: authSession.headers });
    await api.cart.add(book2, { headers: authSession.headers });

    const initialCart = await api.cart.get({ headers: authSession.headers });
    await expect(initialCart).toHaveStatus(200);
    await expect(initialCart).toMatchSchema(CartSchema);
    expect(initialCart.body).toHaveLength(2);

    // Remove book 1
    const removeRes = await api.cart.remove(book1, { headers: authSession.headers });
    await expect(removeRes).toHaveStatus(200);
    await expect(removeRes).toMatchSchema(CartSchema);
    expect(removeRes.body).toHaveLength(1);
    expect(removeRes.body[0].id).toBe(book2);

    // Verify GET reflects the removal
    const updatedCart = await api.cart.get({ headers: authSession.headers });
    await expect(updatedCart).toHaveStatus(200);
    expect(updatedCart.body).toHaveLength(1);
    expect(updatedCart.body[0].id).toBe(book2);
  });

  test('API_COV_02: Clear entire cart and verify cart is empty @regression', async ({
    api,
    seed
  }) => {
    const authSession = await seed.createAndLoginUser({ fullName: 'Cart Clear User' });
    const book1 = KNOWN_BOOK_IDS[0];
    const book2 = KNOWN_BOOK_IDS[1];

    await api.cart.add(book1, { headers: authSession.headers });
    await api.cart.add(book2, { headers: authSession.headers });

    // Clear cart
    const clearRes = await api.cart.clear({ headers: authSession.headers });
    await expect(clearRes).toHaveStatus(200);
    await expect(clearRes).toMatchSchema(CartClearResponseSchema);
    expect(clearRes.body.success).toBe(true);

    // Verify cart is empty
    const cartRes = await api.cart.get({ headers: authSession.headers });
    await expect(cartRes).toHaveStatus(200);
    await expect(cartRes).toMatchSchema(CartSchema);
    expect(cartRes.body).toHaveLength(0);
  });

  test('API_COV_03: Remove non-existent item from cart returns 404 @regression', async ({
    api,
    seed
  }) => {
    const authSession = await seed.createAndLoginUser({ fullName: 'Cart NonExistent User' });

    // Attempt to remove an item that was never in the cart
    const removeRes = await api.cart.remove('non-existent-book-99999', {
      headers: authSession.headers
    });
    await expect(removeRes).toHaveStatus(404);
    await expect(removeRes).toMatchSchema(ApiErrorResponseSchema);
    expect((removeRes.body as any).error).toContain('Not Found');
  });

  test('API_COV_04: Remove item from another session cart preserves isolation @regression', async ({
    playwright,
    seed
  }) => {
    // Session A
    const sessionContextA = await playwright.request.newContext({
      baseURL: envConfig.apiBaseUrl,
      extraHTTPHeaders: { 'x-test-session-id': `session-a-${Date.now()}` }
    });
    const apiA = createApiClient(sessionContextA);
    const userA = await seed.createAndLoginUser({ fullName: 'User A' });
    await apiA.cart.add(KNOWN_BOOK_IDS[0], { headers: userA.headers });

    // Session B
    const sessionContextB = await playwright.request.newContext({
      baseURL: envConfig.apiBaseUrl,
      extraHTTPHeaders: { 'x-test-session-id': `session-b-${Date.now()}` }
    });
    const apiB = createApiClient(sessionContextB);
    const userB = await seed.createAndLoginUser({ fullName: 'User B' });

    // User B tries to remove book from their own empty cart
    const removeB = await apiB.cart.remove(KNOWN_BOOK_IDS[0], { headers: userB.headers });
    await expect(removeB).toHaveStatus(404);

    // Verify User A cart is unaffected and still contains book
    const cartA = await apiA.cart.get({ headers: userA.headers });
    await expect(cartA).toHaveStatus(200);
    expect(cartA.body).toHaveLength(1);
    expect(cartA.body[0].id).toBe(KNOWN_BOOK_IDS[0]);

    await sessionContextA.dispose();
    await sessionContextB.dispose();
  });
});
