import { BasePage } from '@core/base/base.page';
import { By } from 'selenium-webdriver';

export class HomePage extends BasePage {
  private get lblHomePage(): By { return By.xpath("//a[text()=' Home']"); }

  public async verifyLandingPage() {
    await this.logMessage('INFO', "Verifying landing on Home Page");
    let actualText = await this.doGetText(this.lblHomePage, "Checking if Home Page label is visible");
    await this.logMessage('INFO', "Landed on Home Page successfully and Text is: " + actualText);
  }
}
