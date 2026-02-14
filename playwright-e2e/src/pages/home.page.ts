import { BasePage } from '@core/base/base.page';
import { Locator } from 'playwright/types/test';
import { logger } from '@core/logger/logger';

export class HomePage extends BasePage {

  private get lblHomePage(): Locator { return this.page.locator("//a[text()=' Home']"); }

  public async verifyLandingPage() {
    logger.info("Verifying landing on Home Page");
    let actualText = await this.doGetText(this.lblHomePage, "Checking if Home Page label is visible");
    logger.info("Landed on Home Page successfully and Text is: " + actualText);
  }

}
