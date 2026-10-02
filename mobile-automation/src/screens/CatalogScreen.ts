import { BaseMobileScreen } from '../core/BaseMobileScreen.js';

export class CatalogScreen extends BaseMobileScreen {
  constructor() {
    super('CatalogScreen');
  }

  // Locators
  private get searchInput() {
    return 'catalog_search_input';
  }

  private get clearFilterButton() {
    return 'btn_filter_clear';
  }

  private get resultsCount() {
    return 'catalog_results_count';
  }

  private getItemQuickAddButton(bookId: string) {
    return `btn_item_${bookId}_add`;
  }

  private getBookCard(bookId: string) {
    return `card_book_${bookId}`;
  }

  private get bookDetailModal() {
    return 'modal_book_detail';
  }

  private get bookDetailCloseButton() {
    return 'btn_close_detail';
  }

  async isLoaded(): Promise<boolean> {
    return this.isDisplayed(this.searchInput);
  }

  async searchBooks(query: string): Promise<void> {
    await this.step(`Search books with query "${query}"`, async () => {
      await this.typeText(this.searchInput, query);
      await this.hideKeyboard();
    });
  }

  async clearSearch(): Promise<void> {
    await this.step('Clear search filter', async () => {
      if (await this.isDisplayed(this.clearFilterButton)) {
        await this.clickElement(this.clearFilterButton);
      }
    });
  }

  async quickAddToCart(bookId: string): Promise<void> {
    await this.step(`Quick add book "${bookId}" to cart (handling dynamic delay MOB-B3)`, async () => {
      const btn = this.getItemQuickAddButton(bookId);
      await this.clickElement(btn);
      // Wait for dynamic delay to resolve (500-3500ms in live mode)
      await driver.pause(4000);
    });
  }

  async openBookDetail(bookId: string): Promise<void> {
    await this.step(`Open book detail for "${bookId}"`, async () => {
      await this.clickElement(this.getBookCard(bookId));
    });
  }

  async isDetailModalDisplayed(): Promise<boolean> {
    return this.isDisplayed(this.bookDetailModal);
  }

  async closeDetailModal(): Promise<void> {
    await this.step('Close book detail modal / bottom sheet', async () => {
      if (await this.isDisplayed(this.bookDetailCloseButton)) {
        await this.clickElement(this.bookDetailCloseButton);
      }
    });
  }

  async getResultsCountText(): Promise<string> {
    return this.getText(this.resultsCount);
  }
}

export const catalogScreen = new CatalogScreen();
