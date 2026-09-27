import { expect } from '@wdio/globals';
import { LoginPage } from '@pages/LoginPage';
import { CatalogPage } from '@pages/CatalogPage';
import { getLoginCredentials } from '@config/env.config';

describe('BuggyBooks WDIO Auth & Catalog — TC-WDIO-001 @smoke @auth @catalog @wdio', function () {
  this.timeout(60000);
  let loginPage: LoginPage;
  let catalogPage: CatalogPage;

  beforeEach(async () => {
    loginPage = new LoginPage();
    catalogPage = new CatalogPage();
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

  it('TC-WDIO-001.1: Successful Login and Session Verification', async () => {
    await loginPage.navigateToLoginPage();
    const { userName, password } = getLoginCredentials();

    await loginPage.login(userName, password);

    // After login, BuggyBooks lands on catalog with Logout button visible
    await catalogPage.waitForCatalogLoaded();
    const isLogoutVisible = await catalogPage.isLogoutVisible(15000);
    expect(isLogoutVisible).toBe(true);

    // Logout
    await catalogPage.clickLogout();
    const isLoginVisible = await catalogPage.isLoginVisible(15000);
    expect(isLoginVisible).toBe(true);
  });

  it('TC-WDIO-001.2: Login Validation Error with Invalid Password', async () => {
    await loginPage.navigateToLoginPage();
    const { userName } = getLoginCredentials();

    await loginPage.loginWithInvalidCredentials(userName, 'invalidSecretPass123!');

    const errorText = await loginPage.getErrorBannerText();
    expect(errorText).toContain('Invalid credentials');
  });

  it('TC-WDIO-001.3: Catalog Search Filtering and Reset', async () => {
    await catalogPage.navigateToCatalog();
    const initialCount = await catalogPage.getBooksCount();
    expect(initialCount).toBeGreaterThan(0);

    // Search for a known book in BuggyBooks catalog
    await catalogPage.searchBooks('Mockingbird');
    const filteredCount = await catalogPage.waitForBooksCount(1);
    expect(filteredCount).toBe(1);

    const firstTitle = await catalogPage.getFirstBookTitle();
    expect(firstTitle).toContain('Mockingbird');

    // Clear search and verify catalog restores
    await catalogPage.clearSearch();
    const restoredCount = await catalogPage.waitForBooksCount(8);
    expect(restoredCount).toBe(8);
  });
});
