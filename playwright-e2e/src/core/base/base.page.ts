import { logger } from '@core/logger/logger';
import { Page, expect, Locator } from '@playwright/test';

export class BasePage {
  constructor(protected page: Page) { }

  public async doClick(locator: Locator, sLogMessage: string): Promise<void> {
    logger.info(sLogMessage);
    await locator.click();
  }

  public async doEnterText(locator: Locator, sValue: string, sLogMessage: string): Promise<void> {
    logger.info(sLogMessage);
    await locator.fill(sValue);
  }

  public async doGetText(locator: Locator, sLogMessage: string): Promise<string> {
    logger.info(sLogMessage);
    await locator.waitFor({ state: 'visible', timeout: 60000 });
    return await locator.textContent() ?? '';
  }

  public async doGetAttribute(locator: Locator, sAttribute: string, sLogMessage: string): Promise<string | null> {
    logger.info(sLogMessage);
    await locator.waitFor({ state: 'visible', timeout: 60000 });
    const value = await locator.getAttribute(sAttribute);
    logger.info(`Attribute ${sAttribute} has value: ${value}`);
    return value;
  }

}
