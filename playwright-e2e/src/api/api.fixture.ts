import { test as base, expect, APIRequestContext, mergeTests } from '@playwright/test';
import { randomBytes } from 'crypto';
import { envConfig } from '../config/env.config';
import { logger } from '@automationframeworks/playwright-utils';
import { dataTest } from '../core/base/data.fixture';
import { createApiClient, type ApiClientHub } from './clients';
import './matchers/api.matchers';

export { expect, APIRequestContext };
export type { ApiClientHub };

export type ApiFixtureType = {
  testSessionId: string;
  request: APIRequestContext;
  api: ApiClientHub;
};

const apiBaseTest = base.extend<ApiFixtureType>({
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
  },

  api: async ({ request, testSessionId }, use) => {
    const apiHub = createApiClient(request, {
      headers: {
        'x-test-session-id': testSessionId
      }
    });

    await use(apiHub);

    // Ephemeral session cleanup via typed testControl client
    try {
      await apiHub.testControl.deleteSession(testSessionId);
      logger.info(`Cleaned up ephemeral API test session: ${testSessionId}`);
    } catch {
      // Backend may be offline or mock mode; non-blocking
    }
  }
});

export const test = mergeTests(apiBaseTest, dataTest);
