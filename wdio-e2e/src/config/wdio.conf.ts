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
      outputDir: path.resolve(__dirname, '../..', 'allure-results'),
      disableWebdriverStepsReporting: true,
      disableWebdriverScreenshotsReporting: false,
      addConsoleLogs: true,
      reportedEnvironmentVars: {
        Framework: 'WebdriverIO (TypeScript + Mocha)',
        Environment: envConfig.env || 'STAGING',
        Suite: envConfig.SUITENAME || 'Default',
        Browser: 'Google Chrome (DevTools/WebDriver)',
        BaseURL: envConfig.baseUrl,
        OS: `${process.platform} (${process.arch})`,
        NodeVersion: process.version
      }
    }]
  ],
  onPrepare: function () {
    try {
      const resultsDir = path.resolve(__dirname, '../..', 'allure-results');
      if (!fs.existsSync(resultsDir)) {
        fs.mkdirSync(resultsDir, { recursive: true });
      }
      const envPropsPath = path.join(resultsDir, 'environment.properties');
      const props = [
        `Framework=WebdriverIO (TypeScript + Mocha)`,
        `Framework.Version=^9.0.0`,
        `Test.Environment=${envConfig.env || 'STAGING'}`,
        `Base.URL=${envConfig.baseUrl}`,
        `Browser.Target=Google Chrome (DevTools/WebDriver)`,
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
