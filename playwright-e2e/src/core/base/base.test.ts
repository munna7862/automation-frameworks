import { Browser, BrowserContext, Page, TestInfo } from '@playwright/test';
import { BrowserFactory } from '../browser/browser.factory';
import { envConfig } from '../../config/env.config';
import { logger } from '../logger/logger';
import { SignUpPage } from '../../pages/signup.page';
import { CommonFunctions } from '../../utils/common.util';
import { NetworkCaptureMode, NetworkInterceptor } from '../network/network.interceptor';
import { writeFile } from 'fs/promises';
import { test as base } from '@playwright/test';

interface SetupOptions {
  enableNetworkCapture?: boolean;
  networkCaptureMode?: NetworkCaptureMode;
}

type TestFixtures = {
  signUpPage: SignUpPage;
  commonFunctions: CommonFunctions;
};

export class BaseTest {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;
  networkInterceptor?: NetworkInterceptor;

  async setup(options: SetupOptions = {}) {
    this.browser = await BrowserFactory.launch();
    this.context = await this.browser.newContext();

    if (options.enableNetworkCapture) {
      const captureMode = options.networkCaptureMode ?? 'all';
      this.networkInterceptor = new NetworkInterceptor(this.context, captureMode);
      this.networkInterceptor.start();
      logger.info(`Network interception enabled with mode: ${captureMode}`);
    }

    this.page = await this.context.newPage();
    await this.page.goto(envConfig.baseUrl);
    logger.info('Test setup completed');
  }

  async teardown(testInfo: TestInfo) {
    if (testInfo?.status !== testInfo?.expectedStatus) {
      logger.error(`Test failed: ${testInfo.title}`);
    }

    if (this.networkInterceptor) {
      await this.networkInterceptor.stop();
      const networkEntries = this.networkInterceptor.getEntries();
      const outputPath = testInfo.outputPath('network-log.json');
      const networkLog = JSON.stringify(networkEntries, null, 2);

      await writeFile(outputPath, networkLog, 'utf-8');
      await testInfo.attach('network-log', {
        body: Buffer.from(networkLog),
        contentType: 'application/json'
      });
      logger.info(`Captured ${networkEntries.length} network calls. Artifact: ${outputPath}`);
    }

    await this.context.close();
    await this.browser.close();
    logger.info('Test teardown completed');
  }
}

export const test = base.extend<TestFixtures>({

  signUpPage: async ({ page }, use) => {
    await use(new SignUpPage(page));
  },

  commonFunctions: async ({ }, use) => {
    await use(new CommonFunctions());
  }

});


