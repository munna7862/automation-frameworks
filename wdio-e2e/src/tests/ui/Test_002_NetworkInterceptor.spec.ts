import { browser, expect } from '@wdio/globals';
import { BaseTest } from '@core/base/base.test';
import { GithubPage } from '@pages/github.page';
import { CommonFunctions } from '@utils/common.util';

describe('GitHub Search Tests', () => {
  const commonFunctions = new CommonFunctions();

  it('Testcase: Perform GitHub Search', async () => {
    const title = 'Testcase: Perform GitHub Search';
    const base = new BaseTest();

    try {
      await base.setup({ enableNetworkCapture: true, networkCaptureMode: 'api-only' });
      const github = new GithubPage();

      await github.navigateToGithubPage();

      const pageTitle = await github.getPageTitle();
      const isNavigated = await commonFunctions.compareTwoValues(
        pageTitle.includes('GitHub'),
        true,
        'Verifying if navigated to GitHub page successfully'
      );
      await expect(isNavigated).toBeTruthy();

      await github.clickSignInLink();
      const signInTitle = await github.getPageTitle();
      const isSignInPage = await commonFunctions.compareTwoValues(
        signInTitle.includes('Sign in to GitHub'),
        true,
        'Verifying if navigated to Sign In page successfully'
      );
      await expect(isSignInPage).toBeTruthy();

      await browser.pause(3000);
      await base.teardown({ title, passed: true });
    } catch (error) {
      await base.teardown({ title, passed: false });
      throw error;
    }
  });
});
