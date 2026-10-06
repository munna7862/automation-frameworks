import { expect } from 'chai';
import { WebDriver } from 'selenium-webdriver';
import axios from 'axios';
import { DriverFactory } from '@core/driver.factory';
import { LoginPage } from '@pages/LoginPage';
import { CatalogPage } from '@pages/CatalogPage';
import { envConfig } from '@config/env.config';
import { ApiSeeder, createAxiosAdapter, UserData } from '@automationframeworks/test-data';

describe('BuggyBooks Selenium Auth — TC-SEL-001 @smoke @auth @selenium', function () {
  this.timeout(60000);
  let driver: WebDriver;
  let loginPage: LoginPage;
  let catalogPage: CatalogPage;
  let seededUser: UserData;

  before(async () => {
    // Seed fresh, isolated user for Selenium auth suite via ApiSeeder and axios
    const http = createAxiosAdapter(axios, envConfig.apiBaseUrl);
    const seeder = new ApiSeeder(http);
    const result = await seeder.createUser();
    seededUser = result.user;
  });

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
    await loginPage.login(seededUser.username, seededUser.password);

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
    await loginPage.loginWithInvalidCredentials(seededUser.username, 'invalidSecretPass123!');

    const errorText = await loginPage.getErrorBannerText();
    expect(errorText).to.include('Invalid credentials');
  });
});
