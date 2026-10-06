import { test as base, APIRequestContext } from '@playwright/test';
import {
  ApiSeeder,
  CleanupRegistry,
  createPlaywrightAdapter
} from '@automationframeworks/test-data';
import { logger } from '@automationframeworks/playwright-utils';
import { envConfig } from '../../config/env.config';

export type DataFixtures = {
  cleanup: CleanupRegistry;
  seed: ApiSeeder;
};

export const dataTest = base.extend<DataFixtures>({
  cleanup: [
    async ({}, use, testInfo) => {
      const registry = new CleanupRegistry((warning) => {
        logger.warn(warning);
        testInfo.annotations.push({ type: 'cleanup-warning', description: warning });
        testInfo
          .attach('cleanup-warning', {
            body: Buffer.from(warning),
            contentType: 'text/plain'
          })
          .catch(() => undefined);
      });

      await use(registry);

      // LIFO teardown execution guaranteed on both test success and test failure
      await registry.executeAll();
    },
    { auto: true }
  ],

  seed: async (
    { request, cleanup }: { request: APIRequestContext; cleanup: CleanupRegistry },
    use
  ) => {
    const http = createPlaywrightAdapter(request, envConfig.apiBaseUrl);
    const seeder = new ApiSeeder(http, { cleanupRegistry: cleanup });
    await use(seeder);
  }
});
