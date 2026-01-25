import { Browser, BrowserContext, Page, TestInfo } from '@playwright/test';
import { BrowserFactory } from '../browser/browser.factory';
import { envConfig } from '@config/env.config';
import { logger } from '../logger/logger';

export class BaseTest {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;

  async setup() {
    this.browser = await BrowserFactory.launch();
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
    await this.page.goto(envConfig.baseUrl);
    logger.info('Test setup completed');
  }

  async teardown(testInfo: TestInfo) {
    if (testInfo?.status !== testInfo?.expectedStatus) {
      logger.error(`Test failed: ${testInfo.title}`);
    }
    await this.context.close();
    await this.browser.close();
    logger.info('Test teardown completed');
  }
}
