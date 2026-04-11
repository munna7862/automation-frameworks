import type { ChainablePromiseElement } from 'webdriverio';
import { BasePage } from '@core/base/base.page';

export class HomePage extends BasePage {
  private get lblHomePage(): ChainablePromiseElement {
    return $('//a[text()=" Home"]');
  }

  public async verifyLandingPage() {
    await this.logMessage('INFO', 'Verifying landing on Home Page');
    const actualText = await this.doGetText(this.lblHomePage, 'Checking if Home Page label is visible');
    await this.logMessage('INFO', `Landed on Home Page successfully and Text is: ${actualText}`);
  }
}
