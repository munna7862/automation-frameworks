import { expect } from 'chai';
import { BaseTest } from '@core/base/base.test';
import { HomePage } from '@pages/home.page';

describe('Home Page Tests', function () {
  this.timeout(60000); // Mocha default might be tight

  it('Testcase 1: Verify Home page loads', async function () {
    const base = new BaseTest();
    await base.setup();

    const home = new HomePage(base.driver);
    await home.verifyLandingPage();

    await base.teardown(this);
  });

  it('Testcase 2: Verify Home page loads 2', async function () {
    const base = new BaseTest();
    await base.setup();

    const home = new HomePage(base.driver);
    await home.verifyLandingPage();

    await base.teardown(this);
  });
});
