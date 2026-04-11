import { expect } from 'chai';
import { BaseTest } from '@core/base/base.test';
import { GithubPage } from '@pages/github.page';
import { CommonFunctions } from '@utils/common.util';
import { step } from 'allure-js-commons';

describe('GitHub Search Tests', function () {
  this.timeout(120000);

  it('Testcase: Perform GitHub Search (with Network Capture)', async function () {
    const base = new BaseTest();
    const commonFunctions = new CommonFunctions();

    await base.setup({ enableNetworkCapture: true, networkCaptureMode: 'api-only' });
    const github = new GithubPage(base.driver);

    await step('Navigate to GitHub Page', async () => {
      await github.navigateToGithubPage();
    });

    await step('Perform GitHub Search', async () => {
      const pageTitle = await github.getPageTitle();
      let isNavigated = await commonFunctions.compareTwoValues(pageTitle.includes("GitHub"), true, "Verifying if navigated to GitHub page successfully");
      expect(isNavigated).to.be.true;
    });

    await step('Click Sign In Link', async () => {
      await github.clickSignInLink();
      const pageTitle = await github.getPageTitle();
      let isNavigated = await commonFunctions.compareTwoValues(pageTitle.includes("Sign in to GitHub"), true, "Verifying if navigated to Sign In page successfully");
      expect(isNavigated).to.be.true;
    });
    
    await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for a few seconds to ensure all network requests are captured
    
    await base.teardown(this);
  });
});
