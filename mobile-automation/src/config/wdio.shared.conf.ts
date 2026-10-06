import type { Options } from '@wdio/types';
import path from 'path';
import fs from 'fs';
import { Logger } from '../core/Logger.js';

export const sharedConfig: Options.Testrunner = {
  runner: 'local',
  specs: [path.join(process.cwd(), 'src/specs/**/*.spec.ts')],
  maxInstances: 1,
  logLevel: 'info',
  bail: 0,
  waitforTimeout: 20000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 2,
  services: [
    [
      'appium',
      {
        args: {
          relaxedSecurity: true,
          log: path.join(process.cwd(), 'logs', 'appium.log')
        },
        logPath: './logs'
      }
    ]
  ],
  framework: 'mocha',
  reporters: [
    'spec',
    [
      'allure',
      {
        outputDir: 'allure-results',
        disableWebdriverStepsReporting: false,
        disableWebdriverScreenshotsReporting: false,
        useCucumberStepReporter: false
      }
    ]
  ],
  onPrepare: function () {
    try {
      const resultsDir = path.resolve(process.cwd(), 'allure-results');
      if (!fs.existsSync(resultsDir)) {
        fs.mkdirSync(resultsDir, { recursive: true });
      }
      const envPropsPath = path.join(resultsDir, 'environment.properties');
      const props =
        [
          `Framework=Appium 2.x + WebdriverIO Mobile`,
          `Framework.Version=^2.16.1`,
          `Test.Environment=${process.env.ENVIRONMENT || process.env.ENV || 'STAGING'}`,
          `Base.URL=${process.env.BASE_URL || 'https://buggy-books-fe.onrender.com/'}`,
          `API.Base.URL=${process.env.API_BASE_URL || 'https://buggy-books.onrender.com'}`,
          `Browser.Target=UiAutomator2 (Android Emulator - Pixel 6)`,
          `Operating.System=${process.platform} (${process.arch})`,
          `Node.Version=${process.version}`,
          `Timestamp=${new Date().toISOString()}`
        ].join('\n') + '\n';
      fs.writeFileSync(envPropsPath, props, 'utf-8');
    } catch {
      // Non-blocking
    }
  },
  mochaOpts: {
    ui: 'bdd',
    timeout: 90000
  },
  beforeSession: () => {
    Logger.info('Starting WebdriverIO Mobile Automation Session');
  },
  beforeTest: (test) => {
    Logger.info(`Executing Mobile Test: [${test.parent}] > ${test.title}`);
  },
  afterTest: async (test, _context, { error }) => {
    if (error) {
      Logger.error(`Test FAILED: ${test.title} - ${error.message}`);
      try {
        const screenshot = await driver.takeScreenshot();
        const allureReporter = await import('@wdio/allure-reporter');
        allureReporter.default.addAttachment(
          'Failure Screenshot',
          Buffer.from(screenshot, 'base64'),
          'image/png'
        );
      } catch (screenshotErr) {
        Logger.warn(`Could not capture screenshot on failure: ${(screenshotErr as Error).message}`);
      }
    } else {
      Logger.info(`Test PASSED: ${test.title}`);
    }
  }
};
