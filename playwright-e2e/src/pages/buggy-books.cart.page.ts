import { BasePage } from '@core/base/base.page';
import { Locator } from '@playwright/test';

export class BuggyBooksCartPage extends BasePage {
  private get lblYourCart(): Locator { return this.page.locator('heading', { hasText: 'Your Cart' }); }
  private get lblTotalPrice(): Locator { return this.page.locator('heading', { hasText: /Total:/ }); }
  private get btnProceedToCheckout(): Locator { return this.page.locator('button:has-text("Proceed to Checkout")'); }
  private get cartItems(): Locator { return this.page.locator('//div[@class="cartContainer"]//li | //list//listitem'); }
  private get emptyCartMessage(): Locator { return this.page.locator('text=Your cart is empty'); }

  public async verifyCartPageLoaded() {
    await this.logMessage('INFO', 'Verifying Cart page is loaded');
    const isVisible = await this.doesElementExist(this.lblYourCart, 'Checking if Your Cart heading is visible');
    if (!isVisible) {
      throw new Error('Your Cart heading not found');
    }
    await this.logMessage('INFO', 'Cart page loaded successfully');
  }

  public async verifyCartContainsBooks(expectedBookCount: number) {
    await this.logMessage('INFO', `Verifying cart contains ${expectedBookCount} books`);
    const itemCount = await this.cartItems.count();
    if (itemCount < expectedBookCount) {
      throw new Error(`Expected at least ${expectedBookCount} items in cart, but found ${itemCount}`);
    }
    await this.logMessage('INFO', `Cart contains ${itemCount} items - verification passed`);
  }

  public async getCartTotal(): Promise<string> {
    await this.logMessage('INFO', 'Getting cart total amount');
    const totalText = await this.doGetText(this.lblTotalPrice, 'Getting total price text');
    const totalAmount = totalText.match(/\$[\d.]+/)?.[0] || '$0.00';
    await this.logMessage('INFO', `Cart total amount: ${totalAmount}`);
    return totalAmount;
  }

  public async verifyCartTotalIsGreaterThanZero() {
    await this.logMessage('INFO', 'Verifying cart total is greater than zero');
    const totalText = await this.doGetText(this.lblTotalPrice, 'Getting total price');
    const totalAmount = parseFloat(totalText.match(/[\d.]+/)?.[0] || '0');
    if (totalAmount <= 0) {
      throw new Error(`Expected cart total to be greater than zero, but got ${totalAmount}`);
    }
    await this.logMessage('INFO', `Cart total is $${totalAmount} - verification passed`);
  }

  public async verifyCartIsNotEmpty() {
    await this.logMessage('INFO', 'Verifying cart is not empty');
    const isEmpty = await this.doesElementExist(this.emptyCartMessage, 'Checking if empty cart message is visible');
    if (isEmpty) {
      throw new Error('Cart is empty, but expected items to be present');
    }
    await this.logMessage('INFO', 'Cart is not empty - verification passed');
  }

  public async proceedToCheckout() {
    await this.logMessage('INFO', 'Proceeding to checkout');
    await this.doClick(this.btnProceedToCheckout, 'Clicking Proceed to Checkout button');
    await this.logMessage('INFO', 'Proceeded to checkout');
  }
}
