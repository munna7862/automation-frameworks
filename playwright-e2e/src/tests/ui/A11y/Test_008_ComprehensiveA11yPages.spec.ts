import { expect } from '@playwright/test';
import { test } from '../../../core/base/base.fixture';
import { envConfig } from '../../../config/env.config';

test.describe('Comprehensive WCAG 2.1 / 2.2 AA Accessibility Scans Suite', () => {
  // Overrides standard timeout for full multi-page accessibility scans
  test.setTimeout(90000);

  test('UI_A11Y_01: Catalog and Search Results Pages Accessibility @regression @a11y', async ({
    page,
    a11y,
    catalogPage
  }) => {
    await test.step('Scan default Book Catalog page', async () => {
      await page.goto(envConfig.baseUrl);
      await expect(page.getByRole('main')).toBeVisible();
      await page.waitForFunction(() =>
        document.getAnimations().every((a) => a.playState !== 'running')
      );
      await a11y.scan('catalog-default', { exclude: ['.author-meta-tag'] });
    });

    await test.step('Search catalog and scan Search Results state', async () => {
      await catalogPage.searchBooks('Great');
      await a11y.scan('catalog-search-results', { exclude: ['.author-meta-tag'] });
    });
  });

  test('UI_A11Y_02: Book Detail Page Accessibility @regression @a11y', async ({
    page,
    a11y,
    catalogPage,
    bookDetailPage
  }) => {
    await test.step('Navigate to Book Detail page and scan', async () => {
      await page.goto(envConfig.baseUrl);
      await catalogPage.waitForBookCardSelector();
      await catalogPage.clickBookTitle(1);
      await bookDetailPage.waitForTitle();
      await a11y.scan('book-detail');
    });
  });

  test('UI_A11Y_03: Authentication Pages (Login & Register) Accessibility @regression @a11y', async ({
    page,
    a11y,
    signUpPage
  }) => {
    await test.step('Scan Login page', async () => {
      await page.goto(`${envConfig.baseUrl}/login`);
      await signUpPage.waitForLoginPageLoaded();
      await a11y.scan('authentication-login');
    });

    await test.step('Scan Register page', async () => {
      await page.goto(`${envConfig.baseUrl}/register`);
      await signUpPage.waitForRegisterPageLoaded();
      await a11y.scan('authentication-register');
    });
  });

  test('UI_A11Y_04: Cart Page (Empty and Populated) Accessibility @regression @a11y', async ({
    page,
    a11y,
    cartPage,
    catalogPage
  }) => {
    await test.step('Scan Empty Cart page', async () => {
      await page.goto(`${envConfig.baseUrl}/cart`);
      await cartPage.waitForCartHeader();
      await a11y.scan('cart-empty');
    });

    await test.step('Add book and scan Populated Cart page', async () => {
      await page.goto(envConfig.baseUrl);
      await catalogPage.waitForBookCardSelector();
      await catalogPage.clickAddToCartForBook(1);
      await page.goto(`${envConfig.baseUrl}/cart`);
      await cartPage.waitForCartItemOrEmpty();
      await a11y.scan('cart-populated');
    });
  });

  test('UI_A11Y_05: Multi-Step Checkout Wizard & Validation Error States @regression @a11y', async ({
    page,
    a11y,
    catalogPage,
    checkoutPage
  }) => {
    await test.step('Ensure item in cart and navigate to Checkout', async () => {
      await page.goto(envConfig.baseUrl);
      await catalogPage.waitForBookCardSelector();
      await catalogPage.clickAddToCartForBook(1);
      await page.goto(`${envConfig.baseUrl}/checkout`);
      await checkoutPage.waitForNextStepButton();
    });

    await test.step('Scan Checkout Step 1 (Shipping Details)', async () => {
      await a11y.scan('checkout-step-1-shipping');
    });

    await test.step('Trigger and scan Checkout Step 1 Validation Errors state', async () => {
      await checkoutPage.clickNextStepWithoutValidationWait();
      await expect
        .poll(async () => (await checkoutPage.getFieldErrors()).length, { timeout: 5000 })
        .toBeGreaterThan(0);
      await a11y.scan('checkout-step-1-validation-errors', {
        disableRules: ['color-contrast']
      });
    });

    await test.step('Fill Step 1, advance to Step 2, and scan Step 2 (Payment Details)', async () => {
      await checkoutPage.enterFirstName('Accessibility');
      await checkoutPage.enterLastName('Tester');
      await checkoutPage.enterShippingAddress('100 Web Accessibility Lane');
      await checkoutPage.enterCity('Melbourne');
      await checkoutPage.clickNextStep();
      await a11y.scan('checkout-step-2-payment', {
        disableRules: ['color-contrast']
      });
    });

    await test.step('Fill Step 2, advance to Step 3, and scan Step 3 (Confirmation)', async () => {
      await checkoutPage.enterCardNumber('4532000000000000');
      await checkoutPage.enterExpiry('12/30');
      await checkoutPage.enterCvv('123');
      await checkoutPage.clickNextStep();
      await a11y.scan('checkout-step-3-confirm', {
        disableRules: ['color-contrast']
      });
    });

    await test.step('Submit payment and scan Order Confirmation page', async () => {
      await checkoutPage.submitPaymentUntilConfirmation('Payment Successful', 3, 'Order confirmed');
      await a11y.scan('checkout-order-confirmation');
    });
  });

  test('UI_A11Y_06: Profile, Notification Center & Chaos Dashboard Accessibility @regression @a11y', async ({
    page,
    a11y,
    profilePage,
    notificationCenter,
    chaosDashboardPage
  }) => {
    await test.step('Scan User Profile & Order History page', async () => {
      await page.goto(`${envConfig.baseUrl}/profile`);
      await profilePage.waitForProfileLoaded();
      await a11y.scan('user-profile-and-history', {
        disableRules: ['label']
      });
    });

    await test.step('Scan Notification Center Open state', async () => {
      await page.goto(envConfig.baseUrl);
      await notificationCenter.clickBellButton();
      await notificationCenter.isDropdownVisible();
      await a11y.scan('notification-center-dropdown-open', {
        disableRules: ['color-contrast']
      });
    });

    await test.step('Scan Chaos Control Dashboard', async () => {
      await chaosDashboardPage.navigateToDashboard(envConfig.baseUrl);
      await a11y.scan('chaos-dashboard');
    });
  });
});
