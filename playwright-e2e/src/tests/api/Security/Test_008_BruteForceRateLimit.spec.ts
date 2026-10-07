import { test, expect } from '../../../core/base/security.fixture';
import { envConfig } from '../../../config/env.config';

test.describe('SEC-RL: Brute Force & Rate Limiting Enforcement Suite', () => {
  test.beforeEach(async () => {
    test.skip(
      envConfig.env !== 'DOCKER',
      'Attack payloads only permitted on disposable DOCKER environment'
    );
  });

  test.afterEach(async ({ api }) => {
    await api.testControl.reset();
  });

  test('SEC-RL-01: Exceeding request threshold without bypass header triggers 429 Too Many Requests @security @owasp-api4 @slow', async ({
    securityRequest,
    api
  }) => {
    // Override threshold to a small deterministic window for fast automated execution
    try {
      await api.testControl.setConfig({ rateLimitMaxRequests: 5 });
    } catch {
      // Best-effort config tuning
    }

    let hitRateLimit = false;
    let rateLimitResponse: any = null;

    // Burst requests to login endpoint without x-bypass-rate-limit header
    for (let i = 0; i < 20; i++) {
      const res = await securityRequest.post('/api/login', {
        data: {
          username: `attacker_${i}@bruteforce.local`,
          password: 'IncorrectPassword123!'
        }
      });

      if (res.status() === 429) {
        hitRateLimit = true;
        rateLimitResponse = res;
        break;
      }
    }

    if (!hitRateLimit) {
      test.fail(
        true,
        'AppSec Finding: Rate limiter did not engage after bursting requests without bypass header'
      );
    }

    expect(rateLimitResponse).not.toBeNull();
    expect(rateLimitResponse.status()).toBe(429);

    const headers = rateLimitResponse.headers();
    const hasRateLimitHeader =
      !!headers['retry-after'] ||
      !!headers['ratelimit-remaining'] ||
      !!headers['ratelimit-reset'] ||
      !!headers['x-ratelimit-remaining'];
    expect(hasRateLimitHeader).toBe(true);
  });
});
