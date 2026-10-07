import { test as base, expect, APIRequestContext, mergeTests } from '@playwright/test';
import { randomBytes } from 'crypto';
import { envConfig } from '../../config/env.config';
import { logger } from '@automationframeworks/playwright-utils';
import { dataTest } from './data.fixture';
import { createApiClient, type ApiClientHub } from '../../api/clients';
import '../../api/matchers/api.matchers';

export { expect, APIRequestContext };
export type { ApiClientHub };

export type SecurityFixtureType = {
  testSessionId: string;
  securityRequest: APIRequestContext;
  securityApi: ApiClientHub;
  request: APIRequestContext;
  api: ApiClientHub;
};

const securityBaseTest = base.extend<SecurityFixtureType>({
  testSessionId: async ({}, use, testInfo) => {
    const rawId = `pw-sec-w${testInfo.workerIndex}-${testInfo.parallelIndex}-${Date.now()}-${randomBytes(4).toString('hex')}`;
    await use(rawId);
  },

  // Isolated request context without bypass headers (for genuine AppSec attack vectors)
  securityRequest: async ({ playwright, testSessionId }, use) => {
    const context = await playwright.request.newContext({
      baseURL: envConfig.apiBaseUrl,
      extraHTTPHeaders: {
        Accept: 'application/json',
        'x-test-session-id': testSessionId
        // NON-NEGOTIABLE: x-bypass-rate-limit and x-bypass-csrf are strictly OMITTED
      }
    });

    await use(context);
    await context.dispose();
  },

  // Typed API client hub using securityRequest (no bypass headers)
  securityApi: async ({ securityRequest, testSessionId }, use) => {
    const clientHub = createApiClient(securityRequest, {
      omitBypassHeaders: true,
      headers: {
        'x-test-session-id': testSessionId
      }
    });

    await use(clientHub);

    try {
      await clientHub.testControl.deleteSession(testSessionId);
      logger.info(`Cleaned up ephemeral AppSec test session: ${testSessionId}`);
    } catch {
      // Ephemeral cleanup failure is non-blocking
    }
  },

  // Standard request context with rate-limit bypass for setup/teardown utility calls
  request: async ({ playwright, testSessionId }, use) => {
    const context = await playwright.request.newContext({
      baseURL: envConfig.apiBaseUrl,
      extraHTTPHeaders: {
        Accept: 'application/json',
        'x-bypass-rate-limit': 'true',
        'x-test-session-id': testSessionId
      }
    });

    await use(context);
    await context.dispose();
  },

  // Standard API client hub with rate-limit bypass for setup/teardown utility calls
  api: async ({ request, testSessionId }, use) => {
    const apiHub = createApiClient(request, {
      headers: {
        'x-test-session-id': testSessionId
      }
    });

    await use(apiHub);
  }
});

export const test = mergeTests(securityBaseTest, dataTest);
