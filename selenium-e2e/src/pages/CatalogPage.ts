import { By, until, WebElement, Key } from 'selenium-webdriver';
import { BasePage } from '@core/base/base.page';
import { envConfig } from '@config/env.config';

export class CatalogPage extends BasePage {
  // Locators
  private get eleBooks(): By {
    return By.css('.complex-item-box-alpha');
  }

  private get inputSearch(): By {
    return By.id('book-search-input');
  }

  private get btnSearch(): By {
    return By.id('book-search-btn');
  }

  private get btnClearSearch(): By {
    return By.id('book-search-clear-btn');
  }

  private get eleResultCount(): By {
    return By.css('.catalog-result-count');
  }

  private get eleEmptyCatalog(): By {
    return By.css('.catalog-empty');
  }

  private get eleFirstBookTitle(): By {
    return By.css('.title-variant-2 a');
  }

  private get btnLogout(): By {
    return By.xpath("//button[text()='Logout']");
  }

  private getLink(linkText: string): By {
    return By.xpath(`//a[text()='${linkText}']`);
  }

  // Navigation
  public async navigateToCatalog(): Promise<void> {
    await this.logMessage('INFO', `Navigating to catalog: ${envConfig.baseUrl}`);
    await this.driver.get(envConfig.baseUrl);
    await this.waitForCatalogLoaded();
  }

  public async waitForCatalogLoaded(timeoutMs = 30000): Promise<void> {
    await this.driver.wait(
      async () => {
        const books = await this.driver.findElements(this.eleBooks);
        if (books.length > 0) return true;
        const empty = await this.driver.findElements(this.eleEmptyCatalog);
        return empty.length > 0;
      },
      timeoutMs,
      'Catalog did not load within timeout'
    );
  }

  // Book interaction
  public async getBooksCount(): Promise<number> {
    await this.waitForCatalogLoaded();
    const books = await this.driver.findElements(this.eleBooks);
    await this.logMessage('INFO', `Total books displayed: ${books.length}`);
    return books.length;
  }

  public async waitForBooksCount(expectedCount: number, timeoutMs = 15000): Promise<number> {
    await this.driver.wait(
      async () => {
        const books = await this.driver.findElements(this.eleBooks);
        return books.length === expectedCount;
      },
      timeoutMs,
      `Expected ${expectedCount} books but timed out`
    );
    await this.logMessage('INFO', `Books count reached expected: ${expectedCount}`);
    return expectedCount;
  }

  public async getFirstBookTitle(): Promise<string> {
    await this.waitForVisible(this.eleFirstBookTitle);
    return await this.doGetText(this.eleFirstBookTitle, 'Getting first book title');
  }

  public async clickBookTitle(bookId?: string | number): Promise<void> {
    if (bookId !== undefined) {
      const locator = By.css(`.info-cell-beta a[href="/books/${bookId}"]`);
      await this.doClick(locator, `Clicking on book ID: ${bookId}`);
    } else {
      await this.doClick(this.eleFirstBookTitle, 'Clicking first book title');
    }
  }

  // Search actions
  public async searchBooks(term: string): Promise<void> {
    await this.logMessage('INFO', `Searching catalog for: "${term}"`);
    const input = await this.waitForVisible(this.inputSearch);
    await input.click();
    await input.sendKeys(Key.chord(Key.CONTROL, 'a'), Key.BACK_SPACE);
    await input.sendKeys(term);

    const searchBtn = await this.waitForClickable(this.btnSearch);
    await searchBtn.click();

    // Wait for search result count or empty state to appear in DOM
    await this.driver.wait(
      async () => {
        const resultCountEls = await this.driver.findElements(this.eleResultCount);
        if (resultCountEls.length > 0) {
          const text = await resultCountEls[0].getText();
          if (text.toLowerCase().includes(term.toLowerCase())) {
            return true;
          }
        }
        const emptyEls = await this.driver.findElements(this.eleEmptyCatalog);
        if (emptyEls.length > 0) {
          return true;
        }
        return false;
      },
      15000,
      `Search results for "${term}" did not appear in DOM within 15s`
    );
  }

  public async clearSearch(): Promise<void> {
    const clearButtons = await this.driver.findElements(this.btnClearSearch);
    if (clearButtons.length > 0 && (await clearButtons[0].isDisplayed())) {
      await this.logMessage('INFO', 'Clicking Clear Search button');
      await clearButtons[0].click();
      await this.driver.wait(
        async () => {
          const books = await this.driver.findElements(this.eleBooks);
          return books.length > 1;
        },
        15000,
        'Catalog did not reset after clearing search'
      ).catch(() => undefined);
    } else {
      const input = await this.waitForVisible(this.inputSearch);
      await input.click();
      await input.sendKeys(Key.chord(Key.CONTROL, 'a'), Key.BACK_SPACE);
      const searchBtn = await this.waitForClickable(this.btnSearch);
      await searchBtn.click();
      await this.waitForCatalogLoaded();
    }
  }

  public async getResultCountText(): Promise<string> {
    return await this.doGetText(this.eleResultCount, 'Getting catalog result count text');
  }

  public async getEmptyStateText(): Promise<string> {
    return await this.doGetText(this.eleEmptyCatalog, 'Getting catalog empty state text');
  }

  // Navigation Links & Authentication status
  public async clickNavigateLink(linkText: string): Promise<void> {
    const locator = this.getLink(linkText);
    await this.doClick(locator, `Navigating to ${linkText}`);
  }

  public async clickLogout(): Promise<void> {
    await this.doClick(this.btnLogout, 'Clicking Logout button');
  }

  public async isLoginVisible(timeoutMs = 10000): Promise<boolean> {
    try {
      await this.ensureNavElementVisible();
      await this.waitForVisible(this.getLink('Login'), timeoutMs);
      return true;
    } catch {
      return false;
    }
  }

  public async isLogoutVisible(timeoutMs = 10000): Promise<boolean> {
    try {
      await this.ensureNavElementVisible();
      await this.waitForVisible(this.btnLogout, timeoutMs);
      return true;
    } catch {
      return false;
    }
  }
}
