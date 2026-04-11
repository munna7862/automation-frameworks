import type { ChainablePromiseElement } from 'webdriverio';
import { browser } from '@wdio/globals';
import { envConfig } from '@config/env.config';
import { BasePage } from '@core/base/base.page';

export class GithubPage extends BasePage {
  private get signInLink(): ChainablePromiseElement {
    return $('(//a[@href="/login"])[2]');
  }

  public async navigateToGithubPage() {
    await this.logMessage('INFO', 'Navigating to GitHub Page');
    await browser.url(envConfig.githubUrl);
  }

  public async getPageTitle() {
    await this.logMessage('INFO', 'Getting page title');
    return browser.getTitle();
  }

  public async clickSignInLink() {
    await this.doClick(this.signInLink, 'Clicking on Sign In link');
  }
}
