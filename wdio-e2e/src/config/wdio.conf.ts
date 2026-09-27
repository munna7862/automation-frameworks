import 'tsconfig-paths/register';
import * as fs from 'fs';
import * as path from 'path';
import { envConfig } from './env.config';

function loadTestSuite() {
  const suiteName = envConfig.SUITENAME;

  if (suiteName && suiteName !== 'Default') {
    try {
      const suiteFilePath = path.join(__dirname, `../tests/TestSuites/${suiteName}.json`);
      if (fs.existsSync(suiteFilePath)) {
        const suiteData = JSON.parse(fs.readFileSync(suiteFilePath, 'utf-8'));
        return suiteData.testFiles || [];
      }
    } catch (error) {
      console.error('Error loading suite', error);
    }
  }

  return ['./src/tests/ui/**/*.spec.ts'];
}

const browserArgs = envConfig.headless
  ? ['--headless=new', '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage', '--window-size=1920,1080']
  : ['--start-maximized', '--no-sandbox'];

export const config = {
  runner: 'local',
  rootDir: path.resolve(__dirname, '../..'),
  specs: loadTestSuite(),
  exclude: [],
  maxInstances: process.env.CI ? 2 : 1,
  logLevel: 'warn',
  bail: 0,
  baseUrl: envConfig.baseUrl,
  waitforTimeout: 30000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 1,
  framework: 'mocha',
  reporters: [
    'spec',
    ['allure', {
      outputDir: path.resolve(__dirname, '../..', 'reports', 'allure-results'),
      disableWebdriverStepsReporting: true,
      disableWebdriverScreenshotsReporting: false,
      addConsoleLogs: true,
      reportedEnvironmentVars: {
        Environment: envConfig.env || 'staging',
        Suite: envConfig.SUITENAME || 'Default',
        OS: process.platform,
        NodeVersion: process.version
      }
    }]
  ],
  mochaOpts: {
    ui: 'bdd',
    timeout: 120000
  },
  capabilities: [{
    browserName: 'chrome',
    acceptInsecureCerts: true,
    'goog:loggingPrefs': {
      performance: 'ALL'
    },
    'goog:chromeOptions': {
      args: browserArgs
    }
  }],
  afterTest: async function (_test: unknown, _context: unknown, result: { passed: boolean }) {
    if (!result.passed) {
      await browser.takeScreenshot();
    }
  }
};
