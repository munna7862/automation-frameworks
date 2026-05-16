import { expect } from '@playwright/test';
import { test } from '../../../core/base/base.test';
import { envConfig } from '../../../config/env.config';
import TestData from '../../../test-data/ui/UserManagement/Test_002_LoginWithExistingUser.json';
import * as fs from 'fs/promises';
import * as path from 'path';
import { CatalogPage } from '../../../pages/catalog.page';

const AUTH_STATE_FILE = path.join(__dirname, '../../../..', 'auth-state.json');

test.describe('Login With Existing User', () => {

  test('Testcase 1: Login With Existing User', async ({ signUpPage, catalogPage, commonFunctions, page, context, networkInterceptor }) => {
    // networkInterceptor fixture automatically captures network logs (no direct usage needed)
    await page.goto(envConfig.baseUrl);

    await test.step('Perform Login', async () => {
      await catalogPage.clickNavigateLink("Login");
      const isLogin = await signUpPage.login(TestData.USER_NAME, TestData.PASSWORD);
      let isNavigated = await commonFunctions.compareTwoValues(isLogin, true, "Verifying if user logged in successfully");
      expect(isNavigated).toBeTruthy();
    });

    // Save authentication state for reuse in next test (BEFORE logout)
    await test.step('Save Authentication State', async () => {
      const storageState = await context.storageState();
      await fs.writeFile(AUTH_STATE_FILE, JSON.stringify(storageState, null, 2), 'utf-8');
      console.log('Authentication state saved for next test');
    });

    await test.step('Logout', async () => {
      await catalogPage.clickLogout();
      const isLogout = await commonFunctions.compareTwoValues(await catalogPage.isLoginVisible(), true, "Verifying if user logged out successfully");
      expect(isLogout).toBeTruthy();
    });
    await page.waitForTimeout(2000); // Wait for a few seconds to ensure all network requests are captured
  });

  test('Testcase 2: Login Using Saved Session Storage', async ({ browser, signUpPage, catalogPage, commonFunctions, networkInterceptor }) => {
    // Create a new context with the saved storage state
    let context;
    let page;
    try {
      const storageState = JSON.parse(await fs.readFile(AUTH_STATE_FILE, 'utf-8'));
      context = await browser.newContext({ storageState });
      page = await context.newPage();
      console.log('New context created with saved storage state');
    } catch (error) {
      console.error('Failed to load saved authentication state:', error);
      throw new Error('Session state file not found. Please run Testcase 1 first.');
    }

    await page.goto(envConfig.baseUrl);

    await test.step('Verify Logged In Without Re-entering Credentials', async () => {
      await page.waitForLoadState('networkidle');
      // Verify that the logout button is visible (user is logged in)
      await page.locator("//button[text()='Logout']").waitFor({ state: 'visible', timeout: 5000 });
      const isLoggedIn = await page.locator("//button[text()='Logout']").isVisible();
      let isVerified = await commonFunctions.compareTwoValues(isLoggedIn, true, "Verifying if user is logged in using saved session");
      expect(isVerified).toBeTruthy();
    });

    const catalogPageWithNewContext = new CatalogPage(page);
    await test.step('Perform Logout', async () => {
      await catalogPageWithNewContext.clickLogout();
      const isLogout = await commonFunctions.compareTwoValues(await catalogPageWithNewContext.isLoginVisible(), true, "Verifying if user logged out successfully");
      expect(isLogout).toBeTruthy();
    });
    await page.waitForTimeout(2000); // Wait for a few seconds to ensure all network requests are captured
    
    // Cleanup
    await context?.close();
  });

});

