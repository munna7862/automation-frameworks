import { envConfig } from '../config/env.config';
import { BasePage } from '../core/base/base.page';
import { Locator } from '@playwright/test';

export class GithubPage extends BasePage {
  private get signInLink(): Locator     { return this.page.locator("(//a[@href='/login'])[2]"); }

  public async navigateToGithubPage() {
    await this.logMessage('INFO', "Navigating to GitHub Page");
    await this.page.goto(envConfig.githubUrl, { waitUntil: 'domcontentloaded', timeout: 120000 });
  }

  public async getPageTitle() {
    await this.logMessage('INFO', "Getting page title");
    return await this.page.title();
  }

  public async clickSignInLink() {
    await this.doClick(this.signInLink, "Clicking on Sign In link");
  }

}
