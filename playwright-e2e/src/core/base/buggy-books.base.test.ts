import { TestInfo } from '@playwright/test';
import { BaseTest } from './base.test';
import { envConfig } from '@config/env.config';

export class BuggyBooksBaseTest extends BaseTest {
  async setup(options = {}) {
    await super.setup(options);
    // Navigate to BuggyBooks URL instead of baseUrl
    await this.page.goto(envConfig.buggyBooksUrl);
  }
}
