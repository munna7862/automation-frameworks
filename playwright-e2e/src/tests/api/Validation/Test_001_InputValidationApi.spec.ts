import { test, expect } from '../../../api/api.fixture';
import { INVALID_INPUTS, KNOWN_BOOK_IDS } from '@automationframeworks/test-data';
import { ApiErrorResponseSchema, BookSchema, PaginatedBooksSchema } from '../../../api/schemas';

test.describe('API Input Validation & Boundary Matrix Suite', () => {
  test.describe('Registration Boundaries', () => {
    test('API_VAL_01: POST /api/register rejects empty fields with 400 @regression', async ({
      api
    }) => {
      const res = await api.auth.register({
        username: INVALID_INPUTS.EMPTY_STRING,
        password: INVALID_INPUTS.EMPTY_STRING
      });

      await expect(res).toHaveStatus(400);
      await expect(res).toMatchSchema(ApiErrorResponseSchema);
      expect((res.body as any).error).toContain('required');
    });

    test('API_VAL_02: POST /api/register handles whitespace input safely without 500 @regression', async ({
      api
    }) => {
      const res = await api.auth.register({
        username: INVALID_INPUTS.WHITESPACE_ONLY,
        password: 'validPassword123!'
      });

      // Whitespace must either be rejected (400) or accepted cleanly (201); must never return 500
      expect([201, 400]).toContain(res.status);
      expect(res.status).toBeLessThan(500);
    });

    test('API_VAL_03: POST /api/register handles 1-char input without 500 @regression', async ({
      api
    }) => {
      const shortUser = `u_${Date.now()}`;
      const res = await api.auth.register({
        username: shortUser,
        password: 'a'
      });

      expect([201, 400]).toContain(res.status);
      expect(res.status).toBeLessThan(500);
    });

    test('API_VAL_04: POST /api/register handles 256+ character oversized input without 500 @regression', async ({
      api
    }) => {
      const res = await api.auth.register({
        username: `long_${Date.now()}_${INVALID_INPUTS.OVERSIZE_500}`,
        password: 'Password123!'
      });

      expect([201, 400]).toContain(res.status);
      expect(res.status).toBeLessThan(500);
    });

    test('API_VAL_05: POST /api/register handles unicode and emoji strings without 500 @regression', async ({
      api
    }) => {
      const res = await api.auth.register({
        username: `emoji_${Date.now()}_${INVALID_INPUTS.UNICODE_EMOJI}`,
        password: 'Password123!',
        fullName: INVALID_INPUTS.UNICODE_MULTILINGUAL
      });

      expect([201, 400]).toContain(res.status);
      expect(res.status).toBeLessThan(500);
    });

    test('API_VAL_06: POST /api/register rejects duplicate username with 409 @regression', async ({
      api,
      seed
    }) => {
      const session = await seed.createAndLoginUser({ fullName: 'Duplicate User' });

      // Attempt to register again with same username
      const dupRes = await api.auth.register({
        username: session.user.username,
        password: 'AnyPassword123!'
      });

      await expect(dupRes).toHaveStatus(409);
      await expect(dupRes).toMatchSchema(ApiErrorResponseSchema);
      expect((dupRes.body as any).error).toContain('already exists');
    });

    test('API_VAL_07: POST /api/register accepts weak password without 500 @regression', async ({
      api
    }) => {
      const res = await api.auth.register({
        username: `weakpwd_${Date.now()}`,
        password: '123'
      });

      expect([201, 400]).toContain(res.status);
      expect(res.status).toBeLessThan(500);
    });
  });

  test.describe('Cart Item Boundaries', () => {
    test('API_VAL_08: POST /api/cart with quantity boundary handles safely @regression', async ({
      api,
      seed
    }) => {
      const session = await seed.createAndLoginUser({ fullName: 'Cart Boundary User' });

      // Post with quantity 0, -1, 1.5 payload variations
      const resZero = await api.cart.add(KNOWN_BOOK_IDS[0], {
        headers: session.headers,
        data: { bookId: KNOWN_BOOK_IDS[0], quantity: 0 }
      });
      expect(resZero.status).toBeLessThan(500);

      const resNegative = await api.cart.add(KNOWN_BOOK_IDS[0], {
        headers: session.headers,
        data: { bookId: KNOWN_BOOK_IDS[0], quantity: -1 }
      });
      expect(resNegative.status).toBeLessThan(500);
    });

    test('API_VAL_09: POST /api/cart rejects non-existent bookId with 404 @regression', async ({
      api,
      seed
    }) => {
      const session = await seed.createAndLoginUser({ fullName: 'Cart NonExistent User' });
      const res = await api.cart.add('non-existent-book-id-99999', { headers: session.headers });

      await expect(res).toHaveStatus(404);
      await expect(res).toMatchSchema(ApiErrorResponseSchema);
      expect((res.body as any).error).toContain('Not Found');
    });

    test('API_VAL_10: POST /api/cart rejects missing or invalid bookId with 400 @regression', async ({
      api,
      seed
    }) => {
      const session = await seed.createAndLoginUser({ fullName: 'Cart Invalid BookId User' });
      const res = await api.cart.add(undefined as any, {
        headers: session.headers,
        data: { bookId: 12345 } // number instead of string
      });

      await expect(res).toHaveStatus(400);
      await expect(res).toMatchSchema(ApiErrorResponseSchema);
    });

    test('API_VAL_11: POST /api/cart handles SQL injection payload safely @regression', async ({
      api,
      seed
    }) => {
      const session = await seed.createAndLoginUser({ fullName: 'Cart SQL Injection User' });
      const res = await api.cart.add(INVALID_INPUTS.SQL_INJECTION, { headers: session.headers });

      // Must be safely rejected with 404 or 400, never cause 500 internal server error
      expect([400, 404]).toContain(res.status);
      await expect(res).toMatchSchema(ApiErrorResponseSchema);
      expect(res.status).toBeLessThan(500);
    });
  });

  test.describe('Checkout Boundaries', () => {
    test('API_VAL_12: POST /api/checkout/process rejects empty cart with 400 @regression', async ({
      api,
      seed
    }) => {
      const session = await seed.createAndLoginUser({ fullName: 'Empty Cart Checkout User' });

      // Provide valid checkout schema fields so Zod passes and the empty cart check executes
      const res = await api.checkout.process(
        {
          firstName: 'Empty',
          lastName: 'CartUser',
          creditCard: '4532111122223333'
        },
        { headers: session.headers }
      );

      await expect(res).toHaveStatus(400);
      await expect(res).toMatchSchema(ApiErrorResponseSchema);
      expect(res.body.error).toContain('Cart is empty');
    });

    test('API_VAL_13: POST /api/checkout/process rejects missing customer names with 400 @regression', async ({
      api,
      seed
    }) => {
      const session = await seed.createAndLoginUser({ fullName: 'Missing Fields Checkout User' });
      await api.cart.add(KNOWN_BOOK_IDS[0], { headers: session.headers });

      const res = await api.checkout.process(
        {
          // Missing firstName and lastName
          shippingAddress: {
            address: '123 Main St',
            city: 'Anytown',
            zipCode: '12345'
          },
          paymentMethod: 'credit_card',
          creditCard: '4532111122223333'
        } as any,
        { headers: session.headers }
      );

      await expect(res).toHaveStatus(400);
      await expect(res).toMatchSchema(ApiErrorResponseSchema);
    });

    test('API_VAL_14: POST /api/checkout/process rejects invalid card format with 400 @regression', async ({
      api,
      seed
    }) => {
      const session = await seed.createAndLoginUser({ fullName: 'Invalid Card Checkout User' });
      await api.cart.add(KNOWN_BOOK_IDS[0], { headers: session.headers });

      const res = await api.checkout.process(
        {
          firstName: 'John',
          lastName: 'Doe',
          creditCard: '1234' // Less than 16 digits
        },
        { headers: session.headers }
      );

      await expect(res).toHaveStatus(400);
      await expect(res).toMatchSchema(ApiErrorResponseSchema);
    });
  });

  test.describe('Search & Catalog Boundaries', () => {
    test('API_VAL_15: GET /api/books?search= handles very long query without 500 @regression', async ({
      api
    }) => {
      const res = await api.books.list({
        q: INVALID_INPUTS.OVERSIZE_2000,
        page: 1,
        limit: 8
      });

      await expect(res).toHaveStatus(200);
      await expect(res).toMatchSchema(PaginatedBooksSchema);
      expect((res.body as any).books).toHaveLength(0);
      expect(res.status).toBeLessThan(500);
    });

    test('API_VAL_16: GET /api/books?search= handles special punctuation and regex metacharacters @regression', async ({
      api
    }) => {
      const regexChars = '.*+?^${}()|[]\\';
      const res = await api.books.list({
        q: regexChars,
        page: 1,
        limit: 8
      });

      await expect(res).toHaveStatus(200);
      await expect(res).toMatchSchema(PaginatedBooksSchema);
      expect(res.status).toBeLessThan(500);
    });

    test('API_VAL_17: GET /api/books/:id returns 200 for valid ID and 404 for invalid ID @smoke @regression', async ({
      api
    }) => {
      // Valid ID
      const validRes = await api.books.getById(KNOWN_BOOK_IDS[0]);
      await expect(validRes).toHaveStatus(200);
      await expect(validRes).toMatchSchema(BookSchema);
      expect(validRes.body.id).toBe(KNOWN_BOOK_IDS[0]);

      // Invalid ID
      const invalidRes = await api.books.getById('non-existent-book-99999');
      await expect(invalidRes).toHaveStatus(404);
      await expect(invalidRes).toMatchSchema(ApiErrorResponseSchema);
      expect(invalidRes.body.error).toContain('Not Found');
    });
  });
});
