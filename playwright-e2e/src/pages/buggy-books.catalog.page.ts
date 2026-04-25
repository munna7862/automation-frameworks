import { BasePage } from '@core/base/base.page';
import { Locator } from '@playwright/test';

export class BuggyBooksCatalogPage extends BasePage {
  private get lblBookCatalogTitle(): Locator { return this.page.locator('heading', { hasText: 'Book Catalog' }); }
  private get btnAddToCartByBookTitle(): (title: string) => Locator { return (title: string) => this.page.locator(`//heading[contains(text(), '${title}')]/ancestor::td/..//button[contains(text(), 'Add to Cart')]`); }
  private get lnkCart(): Locator { return this.page.locator("a:has-text('Cart')"); }
  private get lnkCatalog(): Locator { return this.page.locator("a:has-text('Catalog')"); }
  private get lnkCheckout(): Locator { return this.page.locator("a:has-text('Checkout')"); }
  private get headerTitle(): Locator { return this.page.locator('h2', { hasText: 'BuggyBooks' }); }

  public async verifyLandingPage() {
    await this.logMessage('INFO', 'Verifying landing on BuggyBooks Catalog Page');
    const isVisible = await this.doesElementExist(this.lblBookCatalogTitle, 'Checking if Book Catalog title is visible');
    if (!isVisible) {
      throw new Error('Book Catalog title not found');
    }
    await this.logMessage('INFO', 'Successfully landed on BuggyBooks Catalog Page');
  }

  public async verifyHeaderBranding() {
    await this.logMessage('INFO', 'Verifying BuggyBooks header branding');
    const headerText = await this.doGetText(this.headerTitle, 'Getting header title');
    if (headerText !== 'BuggyBooks') {
      throw new Error(`Expected header text 'BuggyBooks', but got '${headerText}'`);
    }
    await this.logMessage('INFO', 'BuggyBooks branding verified successfully');
  }

  public async addBookToCart(bookTitle: string) {
    await this.logMessage('INFO', `Adding book "${bookTitle}" to cart`);
    const addToCartBtn = this.btnAddToCartByBookTitle(bookTitle);
    await this.doClick(addToCartBtn, `Clicking Add to Cart button for "${bookTitle}"`);
    await this.logMessage('INFO', `Book "${bookTitle}" added to cart`);
  }

  public async navigateToCart() {
    await this.logMessage('INFO', 'Navigating to Cart page');
    await this.doClick(this.lnkCart, 'Clicking Cart link');
    await this.logMessage('INFO', 'Navigated to Cart page');
  }

  public async navigateToCatalog() {
    await this.logMessage('INFO', 'Navigating to Catalog page');
    await this.doClick(this.lnkCatalog, 'Clicking Catalog link');
    await this.logMessage('INFO', 'Navigated to Catalog page');
  }

  public async navigateToCheckout() {
    await this.logMessage('INFO', 'Navigating to Checkout page');
    await this.doClick(this.lnkCheckout, 'Clicking Checkout link');
    await this.logMessage('INFO', 'Navigated to Checkout page');
  }
}
