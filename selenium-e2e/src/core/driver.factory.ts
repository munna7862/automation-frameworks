import { Builder, WebDriver } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';
import { envConfig } from '@config/env.config';

export class DriverFactory {
  public static async getDriver(): Promise<WebDriver> {
    const options = new chrome.Options();
    if (envConfig.headless) {
      options.addArguments('--headless=new');
    }
    options.addArguments('--disable-gpu');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--window-size=1920,1080');
    options.addArguments('--ignore-certificate-errors');

    const driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();

    await driver.manage().setTimeouts({ implicit: 0, pageLoad: 30000 });
    return driver;
  }

  public static async createDriver(): Promise<WebDriver> {
    return this.getDriver();
  }
}
