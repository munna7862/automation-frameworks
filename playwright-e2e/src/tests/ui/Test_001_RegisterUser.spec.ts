import { expect } from '@playwright/test';
import { test, BaseTest } from '../../core/base/base.test';

test.describe('GitHub Search Tests', () => {
  const base = new BaseTest();

  test('Testcase: Perform GitHub Search', async ({ signUpPage, commonFunctions }, testInfo) => {
    await base.setup({ enableNetworkCapture: true, networkCaptureMode: 'api-only' });

    await test.step('Navigate to SignUp Page', async () => {
      await signUpPage.clickSignUp();
    });

    await test.step('Perform SignUp', async () => {
      const isRegistered = await signUpPage.registerNewUser("autoTestUser", "autoTestUser", "Password123!", "Password123!");
      let isNavigated = await commonFunctions.compareTwoValues(isRegistered, true, "Verifying if user registered successfully");
      expect(isNavigated).toBeTruthy();
    });
    await base.page.waitForTimeout(2000); // Wait for a few seconds to ensure all network requests are captured
    await base.teardown(testInfo);
  });
});

