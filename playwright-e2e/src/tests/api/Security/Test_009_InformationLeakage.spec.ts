import { test, expect } from '../../../core/base/security.fixture';
import { envConfig } from '../../../config/env.config';

test.describe('SEC-LEAK: Information Leakage & Telemetry Sanitization Suite', () => {
  test.afterEach(async ({ api }) => {
    await api.testControl.reset();
  });

  test('SEC-LEAK-01: Non-existent routes return 404 without internal file paths or stack traces @security @owasp-api8', async ({
    securityRequest
  }) => {
    const res = await securityRequest.get('/api/invalid-nonexistent-route-999');
    expect(res.status()).toBe(404);

    const bodyText = await res.text();
    expect(bodyText).not.toContain('node_modules');
    expect(bodyText).not.toContain('/home/');
    expect(bodyText).not.toContain('/app/');
    expect(bodyText).not.toContain('C:\\');
    expect(bodyText).not.toContain('at Function.');
    expect(bodyText).not.toContain('at Module.');
  });

  test('SEC-LEAK-02: 500 error responses induced via chaos do not leak internal stack traces @security @owasp-api8', async ({
    api,
    securityApi
  }) => {
    test.skip(
      envConfig.env !== 'DOCKER',
      'Chaos injection only permitted on disposable DOCKER environment'
    );

    // Force checkout failure rate to 1.0
    await api.testControl.setConfig({ checkoutFailureRate: 1.0 });

    const res = await securityApi.checkout.process(
      { firstName: 'Chaos', lastName: 'Tester', creditCard: '4532111122223333' },
      {
        headers: { Authorization: 'Bearer some-auth-token' },
        expectStatus: [401, 403, 500]
      }
    );

    const bodyText = JSON.stringify(res.data);
    expect(bodyText).not.toContain('node_modules');
    expect(bodyText).not.toContain('at Function.');
    expect(bodyText).not.toContain('at Object.');
    expect(bodyText).not.toContain('Stack trace:');
  });

  test('SEC-LEAK-03: Metrics endpoint exposes operational metrics without secrets or credentials @security @owasp-api8', async ({
    securityApi
  }) => {
    const res = await securityApi.system.metrics({
      expectStatus: [200, 401, 404]
    });

    if (res.status === 200) {
      const text = typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
      expect(text.toLowerCase()).not.toContain('jwt_secret');
      expect(text.toLowerCase()).not.toContain('password123');
      expect(text.toLowerCase()).not.toContain('ci-test-secret');
      expect(text.toLowerCase()).not.toContain('mongodb://');
      expect(text.toLowerCase()).not.toContain('postgres://');
    }
  });
});
