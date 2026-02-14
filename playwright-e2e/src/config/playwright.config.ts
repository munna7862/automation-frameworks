import { defineConfig } from '@playwright/test';
import { envConfig } from './env.config';
import * as path from 'path';
import * as fs from 'fs';

function loadTestSuite() {
  const suiteName = envConfig.SUITENAME;
  console.log(`Suite Name: ${suiteName}`);
  console.log(`USE_SPECIFIC_TESTS: ${envConfig.USE_SPECIFIC_TESTS}`);
  const specificTests = [
    "**/playwright-e2e/src/tests/ui/Test_001_VerifyHomePage.spec.ts",
  ];
  if (envConfig.USE_SPECIFIC_TESTS === true) {
    console.log('Using specific test configuration');
    return specificTests;
  }
  else if (suiteName) {
    try {
      const suiteFilePath = path.join(__dirname, `../tests/TestSuites/${suiteName}.json`);
      if (fs.existsSync(suiteFilePath)) { 
        const suiteData = JSON.parse(fs.readFileSync(suiteFilePath, 'utf-8'));
        console.log(`Loading test suite: ${suiteName}`);
        return suiteData.testFiles || [];
      }
    } catch (e) {
      console.error('Error loading suite', e);
    }
  }
  return ['**/**.spec.ts'];
}

const testSpecs = loadTestSuite();


export default defineConfig({
  testDir: '../tests',
  testMatch: testSpecs,
  fullyParallel: false,  // Enable parallel execution
  timeout: 300 * 1000,
  retries: 1,
  workers: process.env.CI ? 2 : undefined,

  reporter: [
    ['html', { open: 'never' }],
    ['list']
  ],

  use: {
    baseURL: envConfig.baseUrl,
    headless: envConfig.headless,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure'
  },

  outputDir: '../../reports/test-artifacts'
});
