import type { ChainablePromiseElement } from 'webdriverio';
import { CommonFunctions } from '@utils/common.util';

export class BasePage extends CommonFunctions {
  private static readonly DEFAULT_TIMEOUT = 60000;

  public async doClick(locator: ChainablePromiseElement, sLogMessage: string): Promise<void> {
    await this.logMessage('INFO', sLogMessage);
    await locator.waitForDisplayed({ timeout: BasePage.DEFAULT_TIMEOUT });
    await locator.click();
  }

  public async doEnterText(locator: ChainablePromiseElement, sValue: string, sLogMessage: string): Promise<void> {
    await this.logMessage('INFO', sLogMessage);
    await locator.waitForDisplayed({ timeout: BasePage.DEFAULT_TIMEOUT });
    await locator.setValue(sValue);
  }

  public async doGetText(locator: ChainablePromiseElement, sLogMessage: string): Promise<string> {
    await this.logMessage('INFO', sLogMessage);
    await locator.waitForDisplayed({ timeout: BasePage.DEFAULT_TIMEOUT });
    return locator.getText();
  }

  public async doGetAttribute(locator: ChainablePromiseElement, sAttribute: string, sLogMessage: string): Promise<string | null> {
    await this.logMessage('INFO', sLogMessage);
    await locator.waitForDisplayed({ timeout: BasePage.DEFAULT_TIMEOUT });
    const value = await locator.getAttribute(sAttribute);
    await this.logMessage('INFO', `Attribute ${sAttribute} has value: ${value}`);
    return value;
  }

  public async mouseHover(locator: ChainablePromiseElement, sLogMessage: string): Promise<void> {
    await this.logMessage('INFO', sLogMessage);
    await locator.waitForDisplayed({ timeout: BasePage.DEFAULT_TIMEOUT });
    await locator.moveTo();
  }

  public async clearAndSetInputValue(inputField: ChainablePromiseElement, inputValue: string): Promise<void> {
    await inputField.waitForDisplayed({ timeout: BasePage.DEFAULT_TIMEOUT });
    await inputField.click();
    await inputField.clearValue();
    await this.logMessage('INFO', 'Cleared input value');
    await inputField.setValue(inputValue);
    await this.logMessage('INFO', `Set input value to ${inputValue}`);
  }

  public async addTextFieldValue(value: string, fieldLocator: ChainablePromiseElement): Promise<void> {
    await fieldLocator.waitForDisplayed({ timeout: BasePage.DEFAULT_TIMEOUT });
    await fieldLocator.click();
    await fieldLocator.addValue(value);
  }

  public async doesElementExist(locator: ChainablePromiseElement, sLogMessage: string): Promise<boolean> {
    const isVisible = await locator.isDisplayed();
    await this.logMessage('INFO', `${sLogMessage} - Element ${isVisible ? 'is' : 'is not'} visible`);
    return isVisible;
  }
}
