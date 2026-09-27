import type { ChainablePromiseElement, ChainablePromiseArray } from 'webdriverio';
import { BasePage } from '@core/base/base.page';
import { envConfig } from '@config/env.config';

export class CatalogPage extends BasePage {
  // Locators
  private get eleBooks(): ChainablePromiseArray {
    return $$('.complex-item-box-alpha, .book-card');
  }

  private get inputSearch(): ChainablePromiseElement {
    return $('#book-search-input');
  }

  private get btnSearch(): ChainablePromiseElement {
    return $('#book-search-btn');
  }

  private get btnClearSearch(): ChainablePromiseElement {
    return $('#book-search-clear-btn');
  }

  private get eleResultCount(): ChainablePromiseElement {
    return $('.catalog-result-count');
  }

  private get eleEmptyCatalog(): ChainablePromiseElement {
    return $('.catalog-empty');
  }

  private get eleFirstBookTitle(): ChainablePromiseElement {
    return $('.title-variant-2 a, .book-card h3');
  }

  private get btnFirstAddToCart(): ChainablePromiseElement {
    return $('button[id^="add-to-cart-"], .complex-item-box-alpha button');
  }

  private get linkCart(): ChainablePromiseElement {
    return $('//a[contains(text(), "Cart")] | //a[@href="/cart"]');
  }

  private get btnLogout(): ChainablePromiseElement {
    return $('//button[text()="Logout"]');
  }

  private getLink(linkText: string): ChainablePromiseElement {
    return $(`//a[text()='${linkText}']`);
  }

  // Navigation
  public async navigateToCatalog(): Promise<void> {
    await this.logMessage('INFO', `Navigating to catalog: ${envConfig.baseUrl}`);
    await browser.url(envConfig.baseUrl);
    await this.waitForCatalogLoaded();
  }

  public async waitForCatalogLoaded(timeoutMs = 30000): Promise<void> {
    await browser.waitUntil(
      async () => {
        const count = await this.eleBooks.length;
        if (count > 0) return true;
        const empty = await this.eleEmptyCatalog.isDisplayed().catch(() => false);
        return empty;
      },
      {
        timeout: timeoutMs,
        timeoutMsg: 'Catalog did not load within timeout'
      }
    );
  }

  // Book interaction
  public async getBooksCount(): Promise<number> {
    await this.waitForCatalogLoaded();
    const count = await this.eleBooks.length;
    await this.logMessage('INFO', `Total books displayed: ${count}`);
    return count;
  }

  public async waitForBooksCount(expectedCount: number, timeoutMs = 15000): Promise<number> {
    await browser.waitUntil(
      async () => {
        const count = await this.eleBooks.length;
        return count === expectedCount;
      },
      {
        timeout: timeoutMs,
        timeoutMsg: `Expected ${expectedCount} books but timed out`
      }
    );
    await this.logMessage('INFO', `Books count reached expected: ${expectedCount}`);
    return expectedCount;
  }

  public async getFirstBookTitle(): Promise<string> {
    await this.waitForVisible(this.eleFirstBookTitle);
    return await this.doGetText(this.eleFirstBookTitle, 'Getting first book title');
  }

  // Search actions
  public async searchBooks(term: string): Promise<void> {
    await this.logMessage('INFO', `Searching catalog for: "${term}"`);
    await this.waitForVisible(this.inputSearch);
    await this.clearAndSetInputValue(this.inputSearch, term);
    await this.doClick(this.btnSearch, 'Clicking Search button');

    await browser.waitUntil(
      async () => {
        const hasResult = await this.eleResultCount.isDisplayed().catch(() => false);
        if (hasResult) {
          const text = await this.eleResultCount.getText();
          if (text.toLowerCase().includes(term.toLowerCase())) {
            return true;
          }
        }
        const isEmpty = await this.eleEmptyCatalog.isDisplayed().catch(() => false);
        return isEmpty;
      },
      {
        timeout: 15000,
        timeoutMsg: `Search results for "${term}" did not appear in DOM within 15s`
      }
    );
  }

  public async clearSearch(): Promise<void> {
    const isClearVisible = await this.btnClearSearch.isDisplayed().catch(() => false);
    if (isClearVisible) {
      await this.doClick(this.btnClearSearch, 'Clicking Clear Search button');
      await browser.waitUntil(
        async () => {
          const count = await this.eleBooks.length;
          return count > 1;
        },
        {
          timeout: 15000,
          timeoutMsg: 'Catalog did not reset after clearing search'
        }
      ).catch(() => undefined);
    } else {
      await this.clearAndSetInputValue(this.inputSearch, '');
      await this.doClick(this.btnSearch, 'Clicking Search button with empty query');
      await this.waitForCatalogLoaded();
    }
  }

  public async getResultCountText(): Promise<string> {
    return await this.doGetText(this.eleResultCount, 'Getting catalog result count text');
  }

  public async getEmptyStateText(): Promise<string> {
    return await this.doGetText(this.eleEmptyCatalog, 'Getting catalog empty state text');
  }

  // Cart operations
  public async addFirstBookToCart(bookId: number | string = 2): Promise<void> {
    await this.waitForCatalogLoaded();
    const btn = $(`#add-to-cart-${bookId}`);
    if (await btn.isDisplayed().catch(() => false)) {
      await this.waitForClickable(btn);
      await this.doClick(btn, `Clicking Add to Cart button for book ID: ${bookId}`);
    } else {
      const fallbackBtn = $('button[id^="add-to-cart-"], .complex-item-box-alpha button');
      await this.waitForClickable(fallbackBtn);
      await this.doClick(fallbackBtn, 'Clicking Add to Cart button for first book');
    }
    // Wait for the async addToCart (500-2000ms delay + API request) to finish and toast to appear
    await browser.waitUntil(
      async () => {
        const toast = await $('//*[contains(text(), "Added to cart!")]').isDisplayed().catch(() => false);
        return toast;
      },
      {
        timeout: 15000,
        timeoutMsg: 'Toast "Added to cart!" did not appear within 15s'
      }
    ).catch(() => undefined);
    // Pause briefly to ensure cart state update settles in backend
    await browser.pause(1000);
  }

  public async addBookToCartById(bookId: number | string): Promise<void> {
    const btn = $(`#add-to-cart-${bookId}`);
    await this.waitForClickable(btn);
    await this.doClick(btn, `Clicking Add to Cart button for book ID: ${bookId}`);
    await browser.waitUntil(
      async () => {
        const toast = await $('//*[contains(text(), "Added to cart!")]').isDisplayed().catch(() => false);
        return toast;
      },
      {
        timeout: 15000,
        timeoutMsg: 'Toast "Added to cart!" did not appear within 15s'
      }
    ).catch(() => undefined);
    await browser.pause(1000);
  }

  public async navigateToCart(): Promise<void> {
    await this.ensureNavElementVisible();
    await this.doClick(this.linkCart, 'Clicking Cart navigation link');
  }

  // Navigation Links & Authentication status
  public async clickNavigateLink(linkText: string): Promise<void> {
    const locator = this.getLink(linkText);
    await this.ensureNavElementVisible();
    await this.doClick(locator, `Navigating to ${linkText}`);
  }

  public async clickLogout(): Promise<void> {
    await this.ensureNavElementVisible();
    await this.doClick(this.btnLogout, 'Clicking Logout button');
  }

  public async isLoginVisible(timeoutMs = 10000): Promise<boolean> {
    try {
      await this.ensureNavElementVisible();
      await this.getLink('Login').waitForDisplayed({ timeout: timeoutMs });
      return true;
    } catch {
      return false;
    }
  }

  public async isLogoutVisible(timeoutMs = 10000): Promise<boolean> {
    try {
      await this.ensureNavElementVisible();
      await this.btnLogout.waitForDisplayed({ timeout: timeoutMs });
      return true;
    } catch {
      return false;
    }
  }
}
