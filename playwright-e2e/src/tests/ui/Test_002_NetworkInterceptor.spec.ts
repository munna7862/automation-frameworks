import { expect, test } from '@playwright/test';
import { BaseTest } from '@core/base/base.test';
import { GithubPage } from '@pages/github.page';
import { CommonFunctions } from '@utils/common.util';

test.describe('GitHub Search Tests', () => {
  const base = new BaseTest();
  const commonFunctions = new CommonFunctions();

  test('Testcase: Perform GitHub Search', async ({ }, testInfo) => {
    await base.setup();
    const github = new GithubPage(base.page);

    await test.step('Navigate to GitHub Page', async () => {
      await github.navigateToGithubPage();
    });

    await test.step('Perform GitHub Search', async () => {
      const pageTitle = await github.getPageTitle();
      let isNavigated = await commonFunctions.compareTwoValues(pageTitle.includes("GitHub"), true, "Verifying if navigated to GitHub page successfully");
      expect(isNavigated).toBeTruthy();
    });

    await test.step('Click Sign In Link', async () => {
      await github.clickSignInLink();
      const pageTitle = await github.getPageTitle();
      let isNavigated = await commonFunctions.compareTwoValues(pageTitle.includes("Sign in to GitHub"), true, "Verifying if navigated to Sign In page successfully");
      expect(isNavigated).toBeTruthy();
    });
    await base.teardown(testInfo);

  });
});

