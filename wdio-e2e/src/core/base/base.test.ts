import fs from 'fs/promises';
import path from 'path';
import { browser } from '@wdio/globals';
import { envConfig } from '@config/env.config';
import { logger } from '@core/logger/logger';
import { NetworkCaptureMode, NetworkInterceptor } from '@core/network/network.interceptor';

interface SetupOptions {
  enableNetworkCapture?: boolean;
  networkCaptureMode?: NetworkCaptureMode;
}

interface TeardownInfo {
  title?: string;
  passed?: boolean;
}

export class BaseTest {
  networkInterceptor?: NetworkInterceptor;

  async setup(options: SetupOptions = {}) {
    if (options.enableNetworkCapture) {
      const captureMode = options.networkCaptureMode ?? 'all';
      this.networkInterceptor = new NetworkInterceptor(captureMode);
      await this.networkInterceptor.start();
      logger.info(`Network interception enabled with mode: ${captureMode}`);
    }

    await browser.url(envConfig.baseUrl);
    logger.info('Test setup completed');
  }

  async teardown(testInfo: TeardownInfo = {}) {
    if (testInfo.passed === false) {
      logger.error(`Test failed: ${testInfo.title || 'Unknown test'}`);
    }

    if (this.networkInterceptor) {
      await this.networkInterceptor.stop();
      const networkEntries = this.networkInterceptor.getEntries();
      const artifactDir = path.resolve(__dirname, '../../..', 'reports', 'test-artifacts');
      await fs.mkdir(artifactDir, { recursive: true });
      const outputPath = path.join(artifactDir, `network-log-${Date.now()}.json`);
      const networkLog = JSON.stringify(networkEntries, null, 2);

      await fs.writeFile(outputPath, networkLog, 'utf-8');
      this.networkInterceptor.attachToReport('network-log');
      logger.info(`Captured ${networkEntries.length} network calls. Artifact: ${outputPath}`);
    }

    await browser.deleteCookies();
    logger.info('Test teardown completed');
  }
}
