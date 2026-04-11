import { Builder, WebDriver } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';

export class DriverFactory {
  public static async getDriver(): Promise<WebDriver> {
    const options = new chrome.Options();
    // Add default arguments like headless if needed, ignoring certificate errors
    options.addArguments('--ignore-certificate-errors');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    // options.addArguments('--headless'); // Uncomment for headless

    const driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
    
    // Default timeouts
    await driver.manage().setTimeouts({ implicit: 5000, pageLoad: 30000 });
    await driver.manage().window().maximize();

    return driver;
  }
}
