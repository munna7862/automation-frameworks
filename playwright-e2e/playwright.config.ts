import { defineConfig } from '@playwright/test';
import { envConfig } from './src/config/env.config';

export default defineConfig({
  testDir: './src/tests',
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

  outputDir: 'reports/test-artifacts'
});
