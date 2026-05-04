import { expect } from '@playwright/test';
import { test } from '../../../core/base/base.test';
import { envConfig } from '../../../config/env.config';
import TestData from '../../../test-data/ui/UserManagement/Test_002_LoginWithExistingUser.json';

test.describe('Login With Existing User', () => {

  test('Testcase 1: Login With Existing User', async ({ signUpPage, catalogPage, commonFunctions, page, networkInterceptor }) => {
    // networkInterceptor fixture automatically captures network logs (no direct usage needed)
    await page.goto(envConfig.baseUrl);

    await test.step('Perform Login', async () => {
      await catalogPage.clickNavigateLink("Login");
      const isLogin = await signUpPage.login(TestData.USER_NAME, TestData.PASSWORD);
      let isNavigated = await commonFunctions.compareTwoValues(isLogin, true, "Verifying if user logged in successfully");
      expect(isNavigated).toBeTruthy();
    });

    await test.step('Logout', async () => {
      await catalogPage.clickLogout();
      const isLogout = await commonFunctions.compareTwoValues(await catalogPage.isLoginVisible(), true, "Verifying if user logged out successfully");
      expect(isLogout).toBeTruthy();
    });
    await page.waitForTimeout(2000); // Wait for a few seconds to ensure all network requests are captured
  });

});

