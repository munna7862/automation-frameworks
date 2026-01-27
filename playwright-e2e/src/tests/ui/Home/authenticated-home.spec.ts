import { test } from '@playwright/test';
import { AuthBaseTest } from '@core/base/base.testLogin';
import { HomePage } from '@pages/home.page';

test('Access application as authenticated user', async () => {
  const base = new AuthBaseTest();
  await base.setup();

  const home = new HomePage(base.page);
  await home.verifyLandingPage();

  await base.teardown();
});
