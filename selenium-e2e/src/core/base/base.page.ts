import { WebDriver, WebElement, By, until } from 'selenium-webdriver';
import { CommonFunctions } from '@utils/common.util';

export class BasePage extends CommonFunctions {
  protected static readonly DEFAULT_TIMEOUT = 30000;

  constructor(protected driver: WebDriver) {
    super();
  }

  protected async waitForElement(locator: By): Promise<WebElement> {
    const el = await this.driver.wait(until.elementLocated(locator), BasePage.DEFAULT_TIMEOUT);
    await this.driver.wait(until.elementIsVisible(el), BasePage.DEFAULT_TIMEOUT);
    return el;
  }

  public async doClick(locator: By, sLogMessage: string): Promise<void> {
    await this.logMessage('INFO', sLogMessage);
    const el = await this.waitForElement(locator);
    await el.click();
  }

  public async doEnterText(locator: By, sValue: string, sLogMessage: string): Promise<void> {
    await this.logMessage('INFO', sLogMessage);
    const el = await this.waitForElement(locator);
    await el.sendKeys(sValue);
  }

  public async doGetText(locator: By, sLogMessage: string): Promise<string> {
    await this.logMessage('INFO', sLogMessage);
    const el = await this.waitForElement(locator);
    return await el.getText();
  }

  public async doGetAttribute(locator: By, sAttribute: string, sLogMessage: string): Promise<string | null> {
    await this.logMessage('INFO', sLogMessage);
    const el = await this.waitForElement(locator);
    const value = await el.getAttribute(sAttribute);
    await this.logMessage('INFO', `Attribute ${sAttribute} has value: ${value}`);
    return value;
  }

  public async mouseHover(locator: By, sLogMessage: string): Promise<void> {
    await this.logMessage('INFO', sLogMessage);
    const el = await this.waitForElement(locator);
    const actions = this.driver.actions({ bridge: true });
    await actions.move({ origin: el }).perform();
  }

  public async clearAndSetInputValue(locator: By, inputValue: string): Promise<void> {
    const el = await this.waitForElement(locator);
    await el.click();
    await el.clear();
    await this.logMessage('INFO', 'Cleared input value');
    await el.sendKeys(inputValue);
    await this.logMessage('INFO', `Set input value to ${inputValue}`);
  }

  public async addTextFieldValue(value: string, locator: By): Promise<void> {
    const el = await this.waitForElement(locator);
    await el.click();
    await el.sendKeys(value);
  }

  public async doesElementExist(locator: By, sLogMessage: string): Promise<boolean> {
    try {
      const el = await this.driver.findElement(locator);
      const isVisible = await el.isDisplayed();
      await this.logMessage('INFO', `${sLogMessage} - Element ${isVisible ? 'is' : 'is not'} visible`);
      return isVisible;
    } catch (e) {
      await this.logMessage('INFO', `${sLogMessage} - Element is not visible`);
      return false;
    }
  }

}
