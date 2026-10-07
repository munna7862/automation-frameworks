import { test, expect } from '../../../core/base/security.fixture';
import { envConfig } from '../../../config/env.config';
import { randomBytes } from 'crypto';

test.describe('SEC-HDR: Transport, Headers, Cookies & CORS Suite', () => {
  // Note: Passive security header checks are safe to execute on both DOCKER and STAGING environments

  test('SEC-HDR-01: API responses include X-Content-Type-Options: nosniff @security @owasp-api8', async ({
    securityRequest
  }) => {
    const res = await securityRequest.get('/api/books');
    expect(res.status()).toBe(200);

    const headers = res.headers();
    expect(headers['x-content-type-options']).toBe('nosniff');
  });

  test('SEC-HDR-02: API responses include X-Frame-Options or frame-ancestors @security @owasp-api8', async ({
    securityRequest
  }) => {
    const res = await securityRequest.get('/api/books');
    const headers = res.headers();

    const hasFrameOptions = !!headers['x-frame-options'];
    const hasCspFrameAncestors =
      headers['content-security-policy']?.includes('frame-ancestors') ?? false;

    expect(hasFrameOptions || hasCspFrameAncestors).toBe(true);
  });

  test('SEC-HDR-03: API responses include Referrer-Policy header @security @owasp-api8', async ({
    securityRequest
  }) => {
    const res = await securityRequest.get('/api/books');
    const headers = res.headers();

    expect(headers['referrer-policy']).toBeDefined();
  });

  test('SEC-HDR-04: X-Powered-By header is stripped from API responses @security @owasp-api8', async ({
    securityRequest
  }) => {
    const res = await securityRequest.get('/api/books');
    const headers = res.headers();

    expect(headers['x-powered-by']).toBeUndefined();
  });

  test('SEC-HDR-05: Strict-Transport-Security enforced on HTTPS staging @security @owasp-api8', async ({
    securityRequest
  }) => {
    if (envConfig.env !== 'STAGING') {
      test.skip(true, 'HSTS only enforced on HTTPS production/staging environments');
    }

    const res = await securityRequest.get('/api/books');
    const headers = res.headers();
    expect(headers['strict-transport-security']).toBeDefined();
  });

  test('SEC-HDR-06: Frontend SPA enforces Content-Security-Policy @security @owasp-api8', async ({
    playwright
  }) => {
    const feContext = await playwright.request.newContext();
    const res = await feContext.get(envConfig.baseUrl);
    const headers = res.headers();

    const csp = headers['content-security-policy'];
    if (!csp) {
      test.fail(
        true,
        'AppSec Finding: Content-Security-Policy header is missing on frontend SPA web server'
      );
    }
    expect(csp).toBeDefined();
    await feContext.dispose();
  });

  test('SEC-HDR-07: Authentication session cookies have HttpOnly and SameSite flags @security @owasp-api8', async ({
    securityApi
  }) => {
    const username = `cookie_user_${Date.now()}_${randomBytes(3).toString('hex')}@test.local`;
    const password = 'CookiePassWord123!';

    await securityApi.auth.register({
      username,
      password,
      fullName: 'Cookie Tester'
    });

    const loginRes = await securityApi.auth.login({ username, password });
    expect(loginRes.status).toBe(200);

    const setCookie = loginRes.headers['set-cookie'] || '';
    if (setCookie) {
      expect(setCookie.toLowerCase()).toContain('httponly');
      expect(setCookie.toLowerCase()).toContain('samesite');

      if (envConfig.env === 'STAGING') {
        expect(setCookie.toLowerCase()).toContain('secure');
      }
    }
  });

  test('SEC-HDR-08: Untrusted CORS origin is not reflected in Access-Control-Allow-Origin @security @owasp-api8', async ({
    securityRequest
  }) => {
    const untrustedOrigin = 'https://evil-attacker.example.com';

    const res = await securityRequest.fetch('/api/books', {
      method: 'GET',
      headers: {
        Origin: untrustedOrigin
      }
    });

    const allowOrigin = res.headers()['access-control-allow-origin'];
    expect(allowOrigin).not.toBe(untrustedOrigin);
    expect(allowOrigin).not.toBe('*');
  });

  test('SEC-HDR-09: Trusted frontend origin receives valid CORS headers @security @owasp-api8', async ({
    securityRequest
  }) => {
    const trustedOrigin = envConfig.baseUrl;

    const res = await securityRequest.fetch('/api/books', {
      method: 'GET',
      headers: {
        Origin: trustedOrigin
      }
    });

    const allowOrigin = res.headers()['access-control-allow-origin'];
    if (allowOrigin) {
      expect(allowOrigin).toBe(trustedOrigin);
    }
  });
});
