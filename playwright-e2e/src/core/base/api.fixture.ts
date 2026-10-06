import { test as base, expect, APIRequestContext, mergeTests } from '@playwright/test';
import { randomBytes } from 'crypto';
import { envConfig } from '../../config/env.config';
import axios from 'axios';
import { logger } from '@automationframeworks/playwright-utils';
import { dataTest } from './data.fixture';

export { expect, APIRequestContext };

type ApiTestFixtures = {
  testSessionId: string;
  request: APIRequestContext;
};

const apiBaseTest = base.extend<ApiTestFixtures>({
  testSessionId: async ({}, use, testInfo) => {
    const rawId = `pw-api-w${testInfo.workerIndex}-${testInfo.parallelIndex}-${Date.now()}-${randomBytes(4).toString('hex')}`;
    await use(rawId);
  },

  request: async ({ playwright, testSessionId }, use) => {
    const apiContext = await playwright.request.newContext({
      baseURL: envConfig.apiBaseUrl,
      extraHTTPHeaders: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'x-bypass-rate-limit': 'true',
        'x-test-session-id': testSessionId
      }
    });

    await use(apiContext);
    await apiContext.dispose();

    // Session teardown: Clean up backend ephemeral session
    try {
      const apiBase = envConfig.apiBaseUrl;
      await axios.delete(`${apiBase}/api/test/session/${testSessionId}`, {
        headers: { 'x-bypass-rate-limit': 'true', 'x-test-session-id': testSessionId },
        timeout: 5000
      });
      logger.info(`Cleaned up ephemeral API test session: ${testSessionId}`);
    } catch {
      // Backend may be offline or mock mode; non-blocking
    }
  }
});

export const test = mergeTests(apiBaseTest, dataTest);
