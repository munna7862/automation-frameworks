import { expect } from '@wdio/globals';
import { LoginPage } from '@pages/LoginPage';
import { CatalogPage } from '@pages/CatalogPage';
import { CartPage } from '@pages/CartPage';
import { CheckoutPage } from '@pages/CheckoutPage';
import { getLoginCredentials } from '@config/env.config';

describe('BuggyBooks WDIO Cart & Checkout — TC-WDIO-002 @smoke @cart @checkout @shadow-dom @wdio', function () {
  this.timeout(90000);
  let loginPage: LoginPage;
  let catalogPage: CatalogPage;
  let cartPage: CartPage;
  let checkoutPage: CheckoutPage;

  beforeEach(async () => {
    loginPage = new LoginPage();
    catalogPage = new CatalogPage();
    cartPage = new CartPage();
    checkoutPage = new CheckoutPage();
  });

  afterEach(async () => {
    try {
      await browser.execute(() => {
        try {
          localStorage.clear();
          sessionStorage.clear();
        } catch {
          // ignore
        }
      });
    } catch {
      // ignore
    }
    await browser.deleteCookies();
  });

  it('TC-WDIO-002.1: Add Book to Cart, Review Cart, and Navigate Multi-Step Checkout', async () => {
    // 1. Authenticate
    await loginPage.navigateToLoginPage();
    const { userName, password } = getLoginCredentials();
    await loginPage.login(userName, password);
    await catalogPage.waitForCatalogLoaded();

    // 2. Prepare clean cart
    await cartPage.openCart();
    await cartPage.clearAllItemsIfPresent();

    // 3. Add book to cart from catalog
    await catalogPage.navigateToCatalog();
    await catalogPage.addFirstBookToCart();

    // 4. Open cart and review items
    await cartPage.openCart();
    const itemCount = await cartPage.getCartItemsCount();
    expect(itemCount).toBeGreaterThan(0);

    const totalText = await cartPage.getCartTotalText();
    expect(totalText).toContain('$');

    // 5. Proceed to checkout
    await cartPage.proceedToCheckout();

    // 6. Enter shipping details and advance to Payment step
    await checkoutPage.fillShippingDetails('Jane', 'Doe', '123 Buggy Lane', 'Stack City');

    // 7. Verify Payment Step fields are visible
    const isPaymentFieldVisible = await checkoutPage.isPaymentStepVisible();
    expect(isPaymentFieldVisible).toBe(true);
  });

  it('TC-WDIO-002.2: Shadow DOM Piercing on <order-summary-box> and Complete Purchasing Journey', async () => {
    // 1. Authenticate
    await loginPage.navigateToLoginPage();
    const { userName, password } = getLoginCredentials();
    await loginPage.login(userName, password);
    await catalogPage.waitForCatalogLoaded();

    // 2. Ensure cart has an item
    await catalogPage.navigateToCatalog();
    await catalogPage.addFirstBookToCart();
    await cartPage.openCart();
    await cartPage.proceedToCheckout();

    // 3. Complete Step 1: Shipping
    await checkoutPage.fillShippingDetails('Jane', 'Doe', '123 Buggy Lane', 'Stack City');

    // 4. Complete Step 2: Payment
    await checkoutPage.fillPaymentDetails(CheckoutPage.DEFAULT_TEST_CARD, '12/30', '123');

    // Advance to confirmation / summary step if next button is present
    const nextBtn = $('button#wizard-next-btn');
    if (await nextBtn.isDisplayed().catch(() => false)) {
      await nextBtn.click();
    }

    // 5. Pierce native Shadow DOM on <order-summary-box> Web Component
    const isHostPresent = await checkoutPage.isOrderSummaryBoxPresent();
    expect(isHostPresent).toBe(true);
    const summaryTotal = await checkoutPage.getOrderSummaryTotal();
    expect(summaryTotal).toContain('$');

    // 6. Complete Order Submission & Assert Confirmation Message
    const confirmationText = await checkoutPage.getOrderConfirmationMessage();
    const isSuccess = confirmationText.includes('Payment Successful') || confirmationText.includes('Thank you for your order');
    expect(isSuccess).toBe(true);
  });
});
