import { test, expect } from '../../../core/base/security.fixture';
import { envConfig } from '../../../config/env.config';
import { randomBytes } from 'crypto';

test.describe('SEC-CSRF: CSRF Enforcement & Bypass Protection Suite', () => {
  let authToken: string;

  test.beforeEach(async ({ securityApi }) => {
    test.skip(
      envConfig.env !== 'DOCKER',
      'Attack payloads only permitted on disposable DOCKER environment'
    );

    const username = `csrf_user_${Date.now()}_${randomBytes(3).toString('hex')}@test.local`;
    const regRes = await securityApi.auth.register({
      username,
      password: 'CsrfPassword123!',
      fullName: 'CSRF Tester'
    });
    authToken = regRes.data.token;
  });

  test.afterEach(async ({ api }) => {
    await api.testControl.reset();
  });

  test('SEC-CSRF-01: State-changing POST rejected with 403 when x-enforce-csrf is active and token is missing @security @owasp-a01', async ({
    securityApi
  }) => {
    // Attempt state mutation with CSRF enforcement turned on, but without providing CSRF token
    const res = await securityApi.cart.add('1', {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'x-enforce-csrf': 'true'
      },
      expectStatus: [403]
    });

    expect(res.status).toBe(403);
  });

  test('SEC-CSRF-02: State-changing POST accepted when valid CSRF token is provided @security @owasp-a01', async ({
    securityRequest,
    securityApi
  }) => {
    // 1. Fetch CSRF token from endpoint
    const tokenRes = await securityRequest.get('/api/csrf-token');
    expect(tokenRes.status()).toBe(200);

    const data = await tokenRes.json();
    const csrfToken = data.csrfToken;
    expect(csrfToken).toBeDefined();

    // Extract CSRF cookie
    const setCookie = tokenRes.headers()['set-cookie'] || '';

    // 2. Perform state-changing POST with csrf token and cookie
    const res = await securityApi.cart.add('1', {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'x-enforce-csrf': 'true',
        'x-csrf-token': csrfToken,
        Cookie: setCookie
      },
      expectStatus: [200, 201]
    });

    expect([200, 201]).toContain(res.status);
  });

  test('SEC-CSRF-03: Finding — x-bypass-rate-limit skips CSRF verification without enforce header @security @owasp-api8', async ({
    securityApi
  }) => {
    // Per app.ts implementation analysis: sending only x-bypass-rate-limit allows mutating state without CSRF
    const res = await securityApi.cart.add('1', {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'x-bypass-rate-limit': 'true'
      },
      expectStatus: [200, 201, 403]
    });

    if (res.status === 200 || res.status === 201) {
      test.fail(
        true,
        'AppSec Finding: Sending x-bypass-rate-limit: true bypasses CSRF double-submit validation in production build (documented in docs/intentional_bugs.md)'
      );
    }
    expect(res.status).toBe(403);
  });
});
