import { WebDriver, WebElement, By, until } from 'selenium-webdriver';
import { CommonFunctions } from '@utils/common.util';

export class BasePage extends CommonFunctions {
  protected static readonly DEFAULT_TIMEOUT = 30000;

  constructor(protected driver: WebDriver) {
    super();
  }

  public async ensureNavElementVisible(): Promise<void> {
    try {
      const toggleElements = await this.driver.findElements(By.id('mobile-menu-toggle'));
      if (toggleElements.length > 0 && (await toggleElements[0].isDisplayed())) {
        const isExpanded = (await toggleElements[0].getAttribute('aria-expanded')) === 'true';
        if (!isExpanded) {
          await toggleElements[0].click();
        }
      }
    } catch {
      // Non-blocking fallback
    }
  }

  public async waitForElement(
    locator: By,
    timeoutMs = BasePage.DEFAULT_TIMEOUT
  ): Promise<WebElement> {
    const el = await this.driver.wait(
      until.elementLocated(locator),
      timeoutMs,
      `Element located timed out for: ${locator.toString()}`
    );
    await this.driver.wait(
      until.elementIsVisible(el),
      timeoutMs,
      `Element visible timed out for: ${locator.toString()}`
    );
    return el;
  }

  public async waitForVisible(
    locator: By,
    timeoutMs = BasePage.DEFAULT_TIMEOUT
  ): Promise<WebElement> {
    return this.waitForElement(locator, timeoutMs);
  }

  public async waitForElementVisible(
    locator: By,
    timeoutMs = BasePage.DEFAULT_TIMEOUT
  ): Promise<WebElement> {
    return this.waitForElement(locator, timeoutMs);
  }

  public async waitForClickable(
    locator: By,
    timeoutMs = BasePage.DEFAULT_TIMEOUT
  ): Promise<WebElement> {
    const el = await this.waitForVisible(locator, timeoutMs);
    await this.driver.wait(
      until.elementIsEnabled(el),
      timeoutMs,
      `Element clickable timed out for: ${locator.toString()}`
    );
    return el;
  }

  public async waitForElementClickable(
    locator: By,
    timeoutMs = BasePage.DEFAULT_TIMEOUT
  ): Promise<WebElement> {
    return this.waitForClickable(locator, timeoutMs);
  }

  public async waitForElementLocated(
    locator: By,
    timeoutMs = BasePage.DEFAULT_TIMEOUT
  ): Promise<WebElement> {
    return await this.driver.wait(
      until.elementLocated(locator),
      timeoutMs,
      `Element located timed out for: ${locator.toString()}`
    );
  }

  public async waitForUrlContains(
    substring: string,
    timeoutMs = BasePage.DEFAULT_TIMEOUT
  ): Promise<boolean> {
    return await this.driver.wait(
      until.urlContains(substring),
      timeoutMs,
      `URL did not contain "${substring}" within ${timeoutMs}ms`
    );
  }

  public async doClick(locator: By, sLogMessage?: string): Promise<void> {
    if (sLogMessage) {
      await this.logMessage('INFO', sLogMessage);
    }
    const el = await this.waitForClickable(locator);
    await el.click();
  }

  public async doEnterText(locator: By, sValue: string, sLogMessage?: string): Promise<void> {
    if (sLogMessage) {
      await this.logMessage('INFO', sLogMessage);
    }
    const el = await this.waitForVisible(locator);
    await el.sendKeys(sValue);
  }

  public async doGetText(locator: By, sLogMessage?: string): Promise<string> {
    if (sLogMessage) {
      await this.logMessage('INFO', sLogMessage);
    }
    const el = await this.waitForVisible(locator);
    return await el.getText();
  }

  public async doGetAttribute(
    locator: By,
    sAttribute: string,
    sLogMessage?: string
  ): Promise<string | null> {
    if (sLogMessage) {
      await this.logMessage('INFO', sLogMessage);
    }
    const el = await this.waitForVisible(locator);
    const value = await el.getAttribute(sAttribute);
    if (sLogMessage) {
      await this.logMessage('INFO', `Attribute ${sAttribute} has value: ${value}`);
    }
    return value;
  }

  public async mouseHover(locator: By, sLogMessage?: string): Promise<void> {
    if (sLogMessage) {
      await this.logMessage('INFO', sLogMessage);
    }
    const el = await this.waitForVisible(locator);
    const actions = this.driver.actions({ bridge: true });
    await actions.move({ origin: el }).perform();
  }

  public async clearAndSetInputValue(locator: By, inputValue: string): Promise<void> {
    const el = await this.waitForVisible(locator);
    await el.click();
    await el.clear();
    await el.sendKeys(inputValue);
    await this.logMessage('INFO', `Set input value to ${inputValue}`);
  }

  public async addTextFieldValue(value: string, locator: By): Promise<void> {
    const el = await this.waitForVisible(locator);
    await el.click();
    await el.sendKeys(value);
  }

  public async doesElementExist(locator: By, sLogMessage?: string): Promise<boolean> {
    try {
      const elements = await this.driver.findElements(locator);
      if (elements.length === 0) {
        if (sLogMessage) {
          await this.logMessage('INFO', `${sLogMessage} - Element not found`);
        }
        return false;
      }
      const isVisible = await elements[0].isDisplayed();
      if (sLogMessage) {
        await this.logMessage(
          'INFO',
          `${sLogMessage} - Element ${isVisible ? 'is' : 'is not'} visible`
        );
      }
      return isVisible;
    } catch {
      if (sLogMessage) {
        await this.logMessage('INFO', `${sLogMessage} - Element is not visible`);
      }
      return false;
    }
  }

  public async findElements(locator: By): Promise<WebElement[]> {
    return await this.driver.findElements(locator);
  }

  public async getElementCount(locator: By): Promise<number> {
    const elements = await this.driver.findElements(locator);
    return elements.length;
  }
}
