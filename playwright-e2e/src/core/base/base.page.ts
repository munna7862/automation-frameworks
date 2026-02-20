import { Page, Locator } from '@playwright/test';
import { CommonFunctions } from '@utils/common.util';

export class BasePage extends CommonFunctions {

  constructor(protected page: Page) {
    super();
  }

  public async doClick(locator: Locator, sLogMessage: string): Promise<void> {
    await this.logMessage('INFO', sLogMessage);
    await locator.click();
  }

  public async doEnterText(locator: Locator, sValue: string, sLogMessage: string): Promise<void> {
    await this.logMessage('INFO', sLogMessage);
    await locator.fill(sValue);
  }

  public async doGetText(locator: Locator, sLogMessage: string): Promise<string> {
    await this.logMessage('INFO', sLogMessage);
    await locator.waitFor({ state: 'visible', timeout: 60000 });
    return await locator.textContent() ?? '';
  }

  public async doGetAttribute(locator: Locator, sAttribute: string, sLogMessage: string): Promise<string | null> {
    await this.logMessage('INFO', sLogMessage);
    await locator.waitFor({ state: 'visible', timeout: 60000 });
    const value = await locator.getAttribute(sAttribute);
    await this.logMessage('INFO', `Attribute ${sAttribute} has value: ${value}`);
    return value;
  }

}
