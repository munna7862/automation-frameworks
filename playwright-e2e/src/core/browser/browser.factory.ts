import { chromium, firefox, webkit, Browser } from '@playwright/test';
import { envConfig } from '@config/env.config';
import { logger } from '../logger/logger';

export class BrowserFactory {
  static async launch(): Promise<Browser> {
    logger.info(`Launching browser: ${envConfig.browser}`);

    switch (envConfig.browser) {
      case 'firefox':
        return firefox.launch({ headless: envConfig.headless });
      case 'webkit':
        return webkit.launch({ headless: envConfig.headless });
      default:
        return chromium.launch({ headless: envConfig.headless });
    }
  }
}
