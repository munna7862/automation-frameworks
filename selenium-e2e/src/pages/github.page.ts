import { envConfig } from '@config/env.config';
import { BasePage } from '@core/base/base.page';
import { By } from 'selenium-webdriver';

export class GithubPage extends BasePage {
  private get signInLink(): By { return By.xpath("(//a[@href='/login'])[2]"); }

  public async navigateToGithubPage() {
    await this.logMessage('INFO', "Navigating to GitHub Page");
    await this.driver.get(envConfig.githubUrl);
  }

  public async getPageTitle() {
    await this.logMessage('INFO', "Getting page title");
    return await this.driver.getTitle();
  }

  public async clickSignInLink() {
    await this.doClick(this.signInLink, "Clicking on Sign In link");
  }
}
