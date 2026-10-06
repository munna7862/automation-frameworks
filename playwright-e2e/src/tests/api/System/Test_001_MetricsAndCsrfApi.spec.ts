import { test, expect } from '../../../api/api.fixture';
import { KNOWN_BOOK_IDS } from '@automationframeworks/test-data';
import { MetricsSchema, CsrfTokenSchema, HealthSchema } from '../../../api/schemas';

test.describe('System Diagnostics & CSRF API Suite', () => {
  test('API_COV_07: GET /api/metrics returns diagnostics payload matching schema without sensitive data @regression', async ({
    api
  }) => {
    const res = await api.system.metrics();
    await expect(res).toHaveStatus(200);
    await expect(res).toMatchSchema(MetricsSchema);

    const body = res.body;
    expect(body.status).toBe('ok');
    expect(typeof body.uptime).toBe('number');

    // Sensitive data leakage audit: ensure no passwords, secrets, env dumps in telemetry
    const bodyStr = JSON.stringify(body).toLowerCase();
    const sensitiveTokens = [
      'password',
      'secret',
      'private_key',
      'authorization',
      'token',
      'jwt_secret'
    ];
    for (const token of sensitiveTokens) {
      expect(bodyStr).not.toContain(`"${token}"`);
    }
  });

  test('API_COV_08: GET /api/csrf-token returns valid CSRF token and sets psifi.x-csrf-token cookie @smoke @regression', async ({
    api
  }) => {
    const res = await api.system.csrfToken();
    await expect(res).toHaveStatus(200);
    await expect(res).toMatchSchema(CsrfTokenSchema);

    expect(typeof res.body.csrfToken).toBe('string');
    expect(res.body.csrfToken.length).toBeGreaterThan(20);

    // Assert Set-Cookie header contains psifi.x-csrf-token
    const setCookieHeader = res.headers['set-cookie'] || '';
    const cookieString = Array.isArray(setCookieHeader)
      ? setCookieHeader.join('; ')
      : setCookieHeader;
    expect(cookieString).toContain('psifi.x-csrf-token=');
  });

  test('API_COV_09: GET /api/health returns server health and diagnostic status @smoke @regression @staging-contract', async ({
    api
  }) => {
    const res = await api.system.health();
    await expect(res).toHaveStatus(200);
    await expect(res).toMatchSchema(HealthSchema);

    expect(res.body.status).toBe('ok');
    expect(typeof res.body.uptime).toBe('number');
  });

  test('API_COV_10: POST /api/test/books/:id/stock updates book inventory in test mode @regression', async ({
    api
  }) => {
    const bookId = KNOWN_BOOK_IDS[0]; // '1'
    const targetStock = 77;

    const stockRes = await api.testControl.setStock(bookId, targetStock);
    await expect(stockRes).toHaveStatus(200);
    expect(stockRes.body.success).toBe(true);
    expect(stockRes.body.stock).toBe(targetStock);

    // Verify GET book reflects updated stock
    const bookRes = await api.books.getById(bookId);
    await expect(bookRes).toHaveStatus(200);
    expect(bookRes.body.stock).toBe(targetStock);
  });
});
