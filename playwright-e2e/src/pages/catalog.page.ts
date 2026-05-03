import { BasePage } from '../core/base/base.page';
import { Locator } from '@playwright/test';

export class CatalogPage extends BasePage {

  // Define locators for the Sign Up page elements
  private get btnLogout(): Locator {
    return this.page.locator("//button[text()='Logout']");
  }

  private getNavigateLink(sLink: string): Locator {
    return this.page.locator(`//a[text()='${sLink}']`);
  }


  // Add methods to interact with the Sign Up page elements
  public async clickNavigateLink(sLink: string) {
    await this.doClick(this.getNavigateLink(sLink), `Clicking on ${sLink} link`);
  }

  public async clickLogout() {
    await this.doClick(this.btnLogout, "Clicking on Logout button");
  }

  public async verifyCheckoutPage() {
    await this.logMessage('INFO', "Verifying landing on Checkout Page");
    let actualText = await this.doGetText(this.getNavigateLink("Checkout"), "Checking if Checkout label is visible");
    await this.logMessage('INFO', "Landed on Checkout Page successfully and Text is: " + actualText);
    return actualText?.trim() === "Checkout" ? true : false;
  }

  public async isLoginVisible() {
    await this.getNavigateLink("Login").waitFor({ state: 'visible', timeout: 5000 });
    return await this.doesElementExist(this.getNavigateLink("Login"), "Checking if Login link is visible on Catalog page");
  }
}

