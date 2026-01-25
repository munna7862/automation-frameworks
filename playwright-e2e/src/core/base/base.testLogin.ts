import { Browser, BrowserContext, Page } from '@playwright/test';
import { BrowserFactory } from '@core/browser/browser.factory';
import { AuthService } from '@services/auth.service';
import { AuthUtil } from '@utils/auth.util';
import { envConfig } from '@config/env.config';
import { logger } from '@core/logger/logger';

export class AuthBaseTest {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;

  async setup() {
    this.browser = await BrowserFactory.launch();

    const authService = new AuthService();
    const token = await authService.login(
      'eve.holt@reqres.in',
      'cityslicka'
    );

    this.context = await this.browser.newContext();
    await AuthUtil.injectToken(this.context, token);

    this.page = await this.context.newPage();
    await this.page.goto(envConfig.baseUrl);

    logger.info('Authenticated session created via API');
  }

  async teardown() {
    await this.context.close();
    await this.browser.close();
  }
}
