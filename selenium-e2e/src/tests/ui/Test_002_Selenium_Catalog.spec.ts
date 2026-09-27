import { expect } from 'chai';
import { WebDriver } from 'selenium-webdriver';
import { DriverFactory } from '@core/driver.factory';
import { CatalogPage } from '@pages/CatalogPage';

describe('BuggyBooks Selenium Catalog — TC-SEL-002 @smoke @catalog @selenium', function () {
  this.timeout(60000);
  let driver: WebDriver;
  let catalogPage: CatalogPage;

  beforeEach(async () => {
    driver = await DriverFactory.getDriver();
    catalogPage = new CatalogPage(driver);
  });

  afterEach(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  it('TC-SEL-002.1: Verify Initial Catalog Load and Book Cards Display', async () => {
    await catalogPage.navigateToCatalog();
    const count = await catalogPage.getBooksCount();
    expect(count).to.be.greaterThan(0);

    const firstTitle = await catalogPage.getFirstBookTitle();
    expect(firstTitle).to.be.a('string').and.not.be.empty;
  });

  it('TC-SEL-002.2: Verify Keyword Search Filtering and Clear Search', async () => {
    await catalogPage.navigateToCatalog();

    // Search for a known book in BuggyBooks catalog
    await catalogPage.searchBooks('Mockingbird');
    const filteredCount = await catalogPage.waitForBooksCount(1);
    expect(filteredCount).to.equal(1);

    const firstTitle = await catalogPage.getFirstBookTitle();
    expect(firstTitle).to.include('Mockingbird');

    // Clear search and verify catalog restores
    await catalogPage.clearSearch();
    const restoredCount = await catalogPage.waitForBooksCount(8);
    expect(restoredCount).to.equal(8);
  });

  it('TC-SEL-002.3: Verify Empty Catalog State on Non-Existent Search', async () => {
    await catalogPage.navigateToCatalog();

    await catalogPage.searchBooks('xyznonexistentbook12345');
    const emptyText = await catalogPage.getEmptyStateText();
    expect(emptyText.toLowerCase()).to.include('no books found');
  });
});
