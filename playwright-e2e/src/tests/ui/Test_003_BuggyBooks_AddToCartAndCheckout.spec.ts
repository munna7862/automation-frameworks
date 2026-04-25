import { test, expect } from '@playwright/test';
import { BuggyBooksBaseTest } from '@core/base/buggy-books.base.test';
import { BuggyBooksCatalogPage } from '@pages/buggy-books.catalog.page';
import { BuggyBooksCartPage } from '@pages/buggy-books.cart.page';
import { BuggyBooksCheckoutPage } from '@pages/buggy-books.checkout.page';

test.describe('BuggyBooks E2E Test Suite', () => {
  let base: BuggyBooksBaseTest;
  let catalogPage: BuggyBooksCatalogPage;
  let cartPage: BuggyBooksCartPage;
  let checkoutPage: BuggyBooksCheckoutPage;

  test.beforeEach(async () => {
    base = new BuggyBooksBaseTest();
    await base.setup();
    
    // Initialize page objects
    catalogPage = new BuggyBooksCatalogPage(base.page);
    cartPage = new BuggyBooksCartPage(base.page);
    checkoutPage = new BuggyBooksCheckoutPage(base.page);
  });

  test.afterEach(async ({ }, testInfo) => {
    await base.teardown(testInfo);
  });

  test('Test Case 1: Verify Catalog Page Loads with Correct Branding', async () => {
    // Assertion 1: Verify landing on catalog page
    await catalogPage.verifyLandingPage();
    
    // Assertion 2: Verify BuggyBooks branding is displayed
    await catalogPage.verifyHeaderBranding();
  });

  test('Test Case 2: Add Two Books to Cart and Verify Cart Contents', async () => {
    // Assertion 1: Verify catalog page loads
    await catalogPage.verifyLandingPage();
    
    // Action: Add first book to cart
    await catalogPage.addBookToCart('The Great Buggy Gatsby');
    
    // Action: Add second book to cart
    await catalogPage.addBookToCart('To Kill a Mockingbird Exception');
    
    // Navigate to cart
    await catalogPage.navigateToCart();
    
    // Assertion 2: Verify cart page loads
    await cartPage.verifyCartPageLoaded();
    
    // Assertion 3: Verify cart is not empty
    await cartPage.verifyCartIsNotEmpty();
    
    // Assertion 4: Verify cart contains at least 2 books
    await cartPage.verifyCartContainsBooks(2);
    
    // Assertion 5: Verify cart total is greater than zero
    await cartPage.verifyCartTotalIsGreaterThanZero();
    
    // Get cart total for logging
    const cartTotal = await cartPage.getCartTotal();
    console.log(`Cart Total: ${cartTotal}`);
  });

  test('Test Case 3: Complete Full Checkout Flow with Payment', async () => {
    // Setup: Add books to cart
    await catalogPage.verifyLandingPage();
    await catalogPage.addBookToCart('The Great Buggy Gatsby');
    await catalogPage.addBookToCart('To Kill a Mockingbird Exception');
    
    // Navigate to cart
    await catalogPage.navigateToCart();
    
    // Assertions for cart
    await cartPage.verifyCartPageLoaded();
    await cartPage.verifyCartIsNotEmpty();
    await cartPage.verifyCartContainsBooks(2);
    
    // Assertion: Verify cart total is valid
    const cartTotal = await cartPage.getCartTotal();
    expect(cartTotal).toMatch(/\$\d+\.\d{2}/);
    
    // Action: Proceed to checkout
    await cartPage.proceedToCheckout();
    
    // Assertions for checkout page
    await checkoutPage.verifyCheckoutPageLoaded();
    await checkoutPage.verifyOrderSummaryDisplayed();
    await checkoutPage.verifyCheckoutFormFieldsExist();
    
    // Action: Fill checkout form
    await checkoutPage.fillCheckoutForm('John', 'Doe', '4532015112830366');
    
    // Action: Complete payment
    await checkoutPage.completePayment();
    
    // Assertion: Verify payment was successful
    await checkoutPage.verifyPaymentSuccessful();
  });

  test('Test Case 4: Verify Navigation Between Pages', async () => {
    // Assertion 1: Start on catalog page
    await catalogPage.verifyLandingPage();
    
    // Action & Assertion 2: Navigate to catalog from checkout link
    await catalogPage.navigateToCheckout();
    await checkoutPage.verifyCheckoutPageLoaded();
    
    // Action & Assertion 3: Navigate back to catalog
    await catalogPage.navigateToCatalog();
    await catalogPage.verifyLandingPage();
    
    // Action & Assertion 4: Navigate to checkout directly
    await catalogPage.navigateToCheckout();
    await checkoutPage.verifyCheckoutPageLoaded();
  });

  test('Test Case 5: Verify Order Summary is Displayed on Checkout', async () => {
    // Setup: Add books to cart
    await catalogPage.verifyLandingPage();
    await catalogPage.addBookToCart('The Great Buggy Gatsby');
    await catalogPage.addBookToCart('To Kill a Mockingbird Exception');
    await catalogPage.addBookToCart('1984 Bugs');
    
    // Navigate to checkout
    await catalogPage.navigateToCart();
    await cartPage.proceedToCheckout();
    
    // Assertions
    await checkoutPage.verifyCheckoutPageLoaded();
    await checkoutPage.verifyOrderSummaryDisplayed();
    
    // Assertion: Verify total to pay amount
    const totalToPay = await checkoutPage.getTotalToPay();
    expect(totalToPay).toMatch(/\$\d+\.\d{2}/);
    console.log(`Total to Pay: ${totalToPay}`);
  });

  test('Test Case 6: Verify Cart Items Persist After Navigation', async () => {
    // Setup: Add books to cart
    await catalogPage.verifyLandingPage();
    await catalogPage.addBookToCart('The Great Buggy Gatsby');
    
    // Navigate to cart and back to catalog
    await catalogPage.navigateToCart();
    await cartPage.verifyCartIsNotEmpty();
    const initialTotal = await cartPage.getCartTotal();
    
    await catalogPage.navigateToCatalog();
    await catalogPage.verifyLandingPage();
    
    // Navigate back to cart
    await catalogPage.navigateToCart();
    
    // Assertion: Verify items are still in cart
    await cartPage.verifyCartIsNotEmpty();
    const finalTotal = await cartPage.getCartTotal();
    
    // Assertion: Verify total remains the same
    expect(initialTotal).toBe(finalTotal);
    console.log(`Cart total remained consistent: ${finalTotal}`);
  });
});
