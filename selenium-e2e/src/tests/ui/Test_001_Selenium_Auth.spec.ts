import { expect } from 'chai';
import { WebDriver } from 'selenium-webdriver';
import { DriverFactory } from '@core/driver.factory';
import { LoginPage } from '@pages/LoginPage';
import { CatalogPage } from '@pages/CatalogPage';
import { getLoginCredentials } from '@config/env.config';

describe('BuggyBooks Selenium Auth — TC-SEL-001 @smoke @auth @selenium', function () {
  this.timeout(60000);
  let driver: WebDriver;
  let loginPage: LoginPage;
  let catalogPage: CatalogPage;

  beforeEach(async () => {
    driver = await DriverFactory.getDriver();
    loginPage = new LoginPage(driver);
    catalogPage = new CatalogPage(driver);
  });

  afterEach(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  it('TC-SEL-001.1: Successful Login and Logout with Valid Credentials', async () => {
    await loginPage.navigateToLoginPage();
    const { userName, password } = getLoginCredentials();

    await loginPage.login(userName, password);

    // After login, BuggyBooks lands on catalog or home with Logout button visible
    await catalogPage.waitForCatalogLoaded();
    const isLogoutVisible = await catalogPage.isLogoutVisible(10000);
    expect(isLogoutVisible).to.be.true;

    // Logout
    await catalogPage.clickLogout();
    const isLoginVisible = await catalogPage.isLoginVisible(10000);
    expect(isLoginVisible).to.be.true;
  });

  it('TC-SEL-001.2: Login Validation Error with Invalid Password', async () => {
    await loginPage.navigateToLoginPage();
    const { userName } = getLoginCredentials();

    await loginPage.loginWithInvalidCredentials(userName, 'invalidSecretPass123!');

    const errorText = await loginPage.getErrorBannerText();
    expect(errorText).to.include('Invalid credentials');
  });
});
