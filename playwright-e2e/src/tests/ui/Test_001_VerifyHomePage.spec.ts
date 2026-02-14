import { test } from '@playwright/test';
import { BaseTest } from '@core/base/base.test';
import { HomePage } from '@pages/home.page';

test('Testcase 1: Verify Home page loads', async ({ }, testInfo) => {
  const base = new BaseTest();
  await base.setup();

  const home = new HomePage(base.page);
  await home.verifyLandingPage();

  await base.teardown(testInfo);
});

test('Testcase 2: Verify Home page loads 2', async ({ }, testInfo) => {
  const base = new BaseTest();
  await base.setup();

  const home = new HomePage(base.page);
  await home.verifyLandingPage();

  await base.teardown(testInfo);
});

