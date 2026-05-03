import { expect } from '@playwright/test';
import { test } from '../../core/base/base.test';
import { envConfig } from '../../config/env.config';

test.describe('GitHub Search Tests', () => {
  test('Testcase: Perform GitHub Search', async ({ signUpPage, commonFunctions, page }, testInfo) => {
    await page.goto(envConfig.baseUrl);

    await test.step('Navigate to SignUp Page', async () => {
      await signUpPage.clickSignUp();
    });

    await test.step('Perform SignUp', async () => {
      const isRegistered = await signUpPage.registerNewUser("autoTestUser", "autoTestUser", "Password123!", "Password123!");
      let isNavigated = await commonFunctions.compareTwoValues(isRegistered, true, "Verifying if user registered successfully");
      expect(isNavigated).toBeTruthy();
    });
    await page.waitForTimeout(2000); // Wait for a few seconds to ensure all network requests are captured
  });
});

