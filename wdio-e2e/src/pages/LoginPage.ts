import type { ChainablePromiseElement } from 'webdriverio';
import { BasePage } from '@core/base/base.page';
import { envConfig, getLoginCredentials } from '@config/env.config';

export class LoginPage extends BasePage {
  // Locators
  private get inputUsername(): ChainablePromiseElement {
    return $(
      '//label[contains(text(), "Username")]/following-sibling::input | //input[@name="txt_usr_77"] | //input[@name="username"]'
    );
  }

  private get inputPassword(): ChainablePromiseElement {
    return $(
      '//label[contains(text(), "Password")]/following-sibling::input | //input[@name="txt_pwd_99"] | //input[@name="password"]'
    );
  }

  private get btnSubmit(): ChainablePromiseElement {
    return $(
      '//button[@name="btn_submit_login_rnd"] | //button[contains(text(), "Sign In")] | //button[@type="submit"]'
    );
  }

  private get eleErrorBanner(): ChainablePromiseElement {
    return $('.error-banner');
  }

  private get eleLoginTitle(): ChainablePromiseElement {
    return $('.auth-title');
  }

  private get btnLogout(): ChainablePromiseElement {
    return $('//button[text()="Logout"]');
  }

  private get linkLogin(): ChainablePromiseElement {
    return $('//a[text()="Login"]');
  }

  // Navigation
  public async navigateToLoginPage(): Promise<void> {
    await this.logMessage('INFO', `Navigating to login page: ${envConfig.baseUrl}/login`);
    await browser.url(envConfig.baseUrl);
    await this.ensureNavElementVisible();
    if (await this.isLoggedIn()) {
      await this.clickLogout();
      await this.ensureNavElementVisible();
    }
    await this.waitForClickable(this.linkLogin);
    await this.doClick(this.linkLogin, 'Clicking Login link in navbar');
    await this.waitForVisible(this.eleLoginTitle);
  }

  // Field actions
  public async enterUsername(username: string): Promise<void> {
    await this.clearAndSetInputValue(this.inputUsername, username);
  }

  public async enterPassword(password: string): Promise<void> {
    await this.clearAndSetInputValue(this.inputPassword, password);
  }

  public async clickSignIn(): Promise<void> {
    await this.doClick(this.btnSubmit, 'Clicking Sign In button');
  }

  // High-level workflows
  public async login(username?: string, password?: string): Promise<void> {
    const creds = getLoginCredentials();
    const user = username || creds.userName;
    const pass = password || creds.password;

    await this.enterUsername(user);
    await this.enterPassword(pass);
    await this.clickSignIn();
  }

  public async loginWithInvalidCredentials(username: string, password: string): Promise<void> {
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.clickSignIn();
  }

  public async getErrorBannerText(): Promise<string> {
    return await this.doGetText(this.eleErrorBanner, 'Getting error banner text');
  }

  public async getErrorMessage(): Promise<string> {
    return await this.getErrorBannerText();
  }

  public async isLoggedIn(): Promise<boolean> {
    return await this.doesElementExist(this.btnLogout, 'Checking if user is logged in');
  }

  public async isLoginPageLoaded(): Promise<boolean> {
    const isTitleVisible = await this.doesElementExist(this.eleLoginTitle, 'Checking login title');
    const isUsernameVisible = await this.doesElementExist(
      this.inputUsername,
      'Checking username field'
    );
    const isPasswordVisible = await this.doesElementExist(
      this.inputPassword,
      'Checking password field'
    );
    return isTitleVisible && isUsernameVisible && isPasswordVisible;
  }

  public async isLoginLinkVisible(): Promise<boolean> {
    return await this.doesElementExist(this.linkLogin, 'Checking Login navigation link');
  }

  public async clickLogout(): Promise<void> {
    await this.doClick(this.btnLogout, 'Clicking Logout button');
  }
}
