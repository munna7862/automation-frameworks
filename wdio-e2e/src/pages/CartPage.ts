import type { ChainablePromiseElement, ChainablePromiseArray } from 'webdriverio';
import { BasePage } from '@core/base/base.page';
import { envConfig } from '@config/env.config';

export class CartPage extends BasePage {
  // Locators
  private get cartHeader(): ChainablePromiseElement {
    return $('h1*=Your Cart');
  }

  private get cartItems(): ChainablePromiseArray {
    return $$('.cart-item');
  }

  private get removeButtons(): ChainablePromiseArray {
    return $$('.cart-remove-btn');
  }

  private get cartTotalHeading(): ChainablePromiseElement {
    return $('.cart-total-header');
  }

  private get btnClearAll(): ChainablePromiseElement {
    return $('button*=Clear All');
  }

  private get btnProceedToCheckout(): ChainablePromiseElement {
    return $('//button[contains(text(), "Proceed to Checkout")] | //a[contains(text(), "Proceed to Checkout")]');
  }

  private get msgEmptyCart(): ChainablePromiseElement {
    return $('p*=Your cart is empty.');
  }

  private get linkCart(): ChainablePromiseElement {
    return $('//a[contains(text(), "Cart")] | //a[@href="/cart"]');
  }

  // Navigation
  public async navigateToCart(): Promise<void> {
    await this.logMessage('INFO', `Navigating to cart: ${envConfig.baseUrl}/cart`);
    await browser.url(`${envConfig.baseUrl}/cart`);
    await this.waitForCartLoaded();
  }

  public async openCart(): Promise<void> {
    await this.ensureNavElementVisible();
    await this.doClick(this.linkCart, 'Clicking Cart navigation link');
    await this.waitForCartLoaded();
  }

  public async waitForCartLoaded(timeoutMs = 15000): Promise<void> {
    await browser.waitUntil(
      async () => {
        const headerVisible = await this.cartHeader.isDisplayed().catch(() => false);
        return headerVisible;
      },
      {
        timeout: timeoutMs,
        timeoutMsg: 'Cart page header did not load within timeout'
      }
    ).catch(() => undefined);
  }

  // Cart operations
  public async getCartItemsCount(): Promise<number> {
    await this.waitForCartLoaded();
    // Wait for at least one cart item to be visible, or empty state
    await $('.cart-item').waitForDisplayed({ timeout: 10000 }).catch(() => undefined);
    return await this.cartItems.length;
  }

  public async getCartItemText(): Promise<string> {
    await this.getCartItemsCount();
    const count = await this.cartItems.length;
    if (count === 0) return '';
    const texts: string[] = [];
    const items = await this.cartItems;
    for (const item of items) {
      texts.push(await item.getText());
    }
    return texts.join(' ');
  }

  public async getCartTotalText(): Promise<string> {
    await this.waitForVisible(this.cartTotalHeading);
    return await this.doGetText(this.cartTotalHeading, 'Getting cart total text');
  }

  public async getCartTotalAmount(): Promise<number> {
    const text = await this.getCartTotalText();
    const match = text.match(/\$?(\d+\.\d{2})/);
    return match ? parseFloat(match[1]) : 0;
  }

  public async removeFirstCartItem(): Promise<void> {
    const initialCount = await this.getCartItemsCount();
    const removeCount = await this.removeButtons.length;
    if (removeCount > 0) {
      const removes = await this.removeButtons;
      await removes[0].click();
      await browser.waitUntil(
        async () => {
          const currentCount = await this.getCartItemsCount();
          return currentCount < initialCount || (await this.isCartEmpty());
        },
        {
          timeout: 10000,
          timeoutMsg: 'Cart item count did not decrease after removal'
        }
      ).catch(() => undefined);
    }
  }

  public async clearAllItemsIfPresent(): Promise<void> {
    await this.waitForCartLoaded();
    const isClearVisible = await this.btnClearAll.isDisplayed().catch(() => false);
    if (isClearVisible) {
      await this.doClick(this.btnClearAll, 'Clicking Clear All button');
      await this.waitForHidden(this.btnClearAll, 10000);
    }
  }

  public async proceedToCheckout(): Promise<void> {
    await this.waitForClickable(this.btnProceedToCheckout);
    await this.doClick(this.btnProceedToCheckout, 'Clicking Proceed to Checkout button');
  }

  public async isCartEmpty(): Promise<boolean> {
    const isEmptyVisible = await this.msgEmptyCart.isDisplayed().catch(() => false);
    const count = await this.cartItems.length;
    return isEmptyVisible || count === 0;
  }
}
