import { test, expect } from '../../../api/api.fixture';
import { KNOWN_BOOK_IDS } from '@automationframeworks/test-data';
import { CheckoutResponseSchema, ApiErrorResponseSchema } from '../../../api/schemas';

test.describe('Checkout Concurrency & Race Condition API Suite', () => {
  test.afterEach(async ({ api }) => {
    await api.testControl.reset();
  });

  test('API_ERR_01: Error envelope schema consistency and internal stack leakage prevention @regression', async ({
    api
  }) => {
    // 1. Request a non-existent resource
    const res = await api.books.getById('non-existent-book-error-audit-99999');
    await expect(res).toHaveStatus(404);
    await expect(res).toMatchSchema(ApiErrorResponseSchema);

    // 2. Audit body for stack trace or internal filesystem path leakage
    const rawBody = JSON.stringify(res.body);
    expect(rawBody).not.toMatch(/node_modules|at\s+\w+\s+\(/i);
    expect(rawBody).not.toMatch(/\/src\/|\\src\\/i);
    expect((res.body as any).stack).toBeUndefined();

    // 3. Verify correlation ID header is generated
    const correlationHeader = res.headers['x-correlation-id'];
    expect(correlationHeader).toBeTruthy();
  });

  test('API_ERR_02: Double-submit checkout concurrency race condition test @regression', async ({
    api,
    seed
  }) => {
    // 1. Seed user with 1 book in cart
    const session = await seed.createAndLoginUser({ fullName: 'Concurrent Checkout User' });
    const bookId = KNOWN_BOOK_IDS[0]; // '1'
    await api.cart.add(bookId, { headers: session.headers });

    // Verify initial stock
    const initialBook = await api.books.getById(bookId);
    await expect(initialBook).toHaveStatus(200);
    const initialStock = initialBook.body.stock ?? 10;

    const checkoutPayload = {
      firstName: 'Concurrent',
      lastName: 'Tester',
      creditCard: '4532111122223333'
    };

    // 2. Fire concurrent checkout submissions simultaneously using Promise.all
    const [res1, res2] = await Promise.all([
      api.checkout.process(checkoutPayload, { headers: session.headers }),
      api.checkout.process(checkoutPayload, { headers: session.headers })
    ]);

    const statuses = [res1.status, res2.status];
    // Exactly one must succeed (200 OK); the second must be rejected (400 or 409)
    const successCount = statuses.filter((s) => s === 200).length;
    expect(successCount).toBe(1);

    const successfulRes = res1.status === 200 ? res1 : res2;
    const rejectedRes = res1.status === 200 ? res2 : res1;

    await expect(successfulRes).toHaveStatus(200);
    await expect(successfulRes).toMatchSchema(CheckoutResponseSchema);
    expect(successfulRes.body.orderId).toBeTruthy();

    expect([400, 409]).toContain(rejectedRes.status);
    await expect(rejectedRes).toMatchSchema(ApiErrorResponseSchema);

    // 3. Verify user orders: exactly 1 order placed
    const ordersRes = await api.orders.list({ headers: session.headers });
    await expect(ordersRes).toHaveStatus(200);
    expect(ordersRes.body).toHaveLength(1);

    // 4. Verify inventory was decremented exactly once
    const updatedBook = await api.books.getById(bookId);
    await expect(updatedBook).toHaveStatus(200);
    expect(updatedBook.body.stock).toBe(initialStock - 1);
  });
});
