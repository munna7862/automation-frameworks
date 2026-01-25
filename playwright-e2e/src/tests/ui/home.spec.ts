import { test } from '@playwright/test';
import { BaseTest } from '@core/base/base.test';
import { HomePage } from '@pages/home.page';

test('Verify Playwright home page loads', async ({}, testInfo) => {
  const base = new BaseTest();
  await base.setup();

  const home = new HomePage(base.page);
  await home.verifyLandingPage();

  await base.teardown(testInfo);
});
