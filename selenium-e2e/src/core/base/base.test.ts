import { WebDriver } from 'selenium-webdriver';
import { DriverFactory } from '../driver.factory';
import { envConfig } from '@config/env.config';
import { logger } from '../logger/logger';
import { writeFile } from 'fs/promises';
import { Context } from 'mocha';

interface SetupOptions {
  enableNetworkCapture?: boolean;
  networkCaptureMode?: 'all' | 'api-only';
}

export class BaseTest {
  driver!: WebDriver;
  cdpConnection: any;
  networkEntries: any[] = [];
  captureMode?: 'all' | 'api-only';
  intercepting = false;

  async setup(options: SetupOptions = {}) {
    this.driver = await DriverFactory.getDriver();
    this.networkEntries = [];

    if (options.enableNetworkCapture) {
      this.captureMode = options.networkCaptureMode || 'all';
      this.intercepting = true;
      try {
        this.cdpConnection = await this.driver.createCDPConnection("page");
        await this.cdpConnection.execute("Network.enable", { maxTotalBufferSize: 10000000, maxResourceBufferSize: 5000000 });
        
        // Listen to Network.requestWillBeSent
        this.cdpConnection._wsConnection.on('message', (message: string) => {
          const parsed = JSON.parse(message);
          if (parsed.method === 'Network.requestWillBeSent') {
            const req = parsed.params.request;
            const isApi = req.url.includes('/api/') || req.method !== 'GET';
            if (this.captureMode === 'all' || (this.captureMode === 'api-only' && isApi)) {
              this.networkEntries.push({
                url: req.url,
                method: req.method,
                headers: req.headers
              });
            }
          }
        });
        logger.info(`Network interception enabled with mode: ${this.captureMode}`);
      } catch (err) {
        logger.warn('CDP network interception is mostly supported on Chromium-based browsers only.');
      }
    }

    await this.driver.get(envConfig.baseUrl);
    logger.info('Test setup completed');
  }

  async teardown(testContext?: Context) {
    if (testContext && testContext.currentTest?.state === 'failed') {
      logger.error(`Test failed: ${testContext.currentTest.title}`);
    }

    if (this.intercepting) {
      this.intercepting = false;
      const outputPath = `./allure-results/network-log-${Date.now()}.json`;
      const networkLog = JSON.stringify(this.networkEntries, null, 2);

      await writeFile(outputPath, networkLog, 'utf-8');
      logger.info(`Captured ${this.networkEntries.length} network calls. Artifact: ${outputPath}`);
      // In Mocha+Allure, attaching requires standard allure methods if needed. We save to disk as artifact.
    }

    if (this.cdpConnection) {
        // Driver close usually handles it, but explicit cleanup is good if API supports it easily.
    }

    if (this.driver) {
      await this.driver.quit();
    }
    logger.info('Test teardown completed');
  }
}
