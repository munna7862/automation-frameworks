import allureReporter from '@wdio/allure-reporter';
import { Status } from 'allure-js-commons';
import { Logger } from '../utils/Logger.js';

export abstract class BaseMobileScreen {
  protected screenName: string;

  constructor(screenName: string) {
    this.screenName = screenName;
  }

  /**
   * Resolves selector: if raw accessibility ID, XPath or platform selector, uses directly;
   * otherwise prepends '~' for React Native testID / accessibilityLabel.
   */
  protected getElement(selector: string): ChainablePromiseElement {
    if (
      selector.startsWith('~') ||
      selector.startsWith('//') ||
      selector.startsWith('android=') ||
      selector.startsWith('ios=') ||
      selector.startsWith('*[')
    ) {
      return $(selector);
    }
    return $(`~${selector}`);
  }

  /**
   * Executes an action wrapped with structured Winston logging and Allure step recording.
   */
  protected async step<T>(stepName: string, action: () => Promise<T>): Promise<T> {
    const fullStep = `[${this.screenName}] ${stepName}`;
    Logger.info(`STEP: ${fullStep}`);
    allureReporter.startStep(fullStep);
    try {
      const result = await action();
      allureReporter.endStep(Status.PASSED);
      return result;
    } catch (error) {
      Logger.error(`STEP FAILED: ${fullStep} - ${(error as Error).message}`);
      allureReporter.endStep(Status.FAILED);
      throw error;
    }
  }

  /**
   * Wait for an element to be displayed within the given timeout.
   */
  async waitForElement(selector: string, timeout = 15000): Promise<ChainablePromiseElement> {
    return this.step(`Wait for element visible: ${selector}`, async () => {
      const el = this.getElement(selector);
      await el.waitForDisplayed({ timeout, timeoutMsg: `Element ${selector} not displayed after ${timeout}ms` });
      return el;
    });
  }

  /**
   * Wait for an element to disappear / not be displayed.
   */
  async waitForElementDisappear(selector: string, timeout = 15000): Promise<void> {
    await this.step(`Wait for element to disappear: ${selector}`, async () => {
      const el = this.getElement(selector);
      await el.waitForDisplayed({ reverse: true, timeout });
    });
  }

  /**
   * Click/tap on an element.
   */
  async clickElement(selector: string, timeout = 15000): Promise<void> {
    await this.step(`Click element: ${selector}`, async () => {
      const el = await this.waitForElement(selector, timeout);
      await el.click();
    });
  }

  /**
   * Enter text into an input element. Automatically sanitizes logs if sensitive.
   */
  async typeText(selector: string, text: string, isSensitive = false): Promise<void> {
    const logVal = isSensitive ? '[REDACTED]' : text;
    await this.step(`Type into ${selector}: "${logVal}"`, async () => {
      const el = await this.waitForElement(selector);
      await el.clearValue();
      await el.setValue(text);
    });
  }

  /**
   * Get text content of an element.
   */
  async getText(selector: string, timeout = 15000): Promise<string> {
    return this.step(`Get text from ${selector}`, async () => {
      const el = await this.waitForElement(selector, timeout);
      return el.getText();
    });
  }

  /**
   * Checks if an element is currently displayed without throwing.
   */
  async isDisplayed(selector: string, _timeout = 3000): Promise<boolean> {
    try {
      const el = this.getElement(selector);
      return await el.isDisplayed();
    } catch {
      return false;
    }
  }

  /**
   * Dismiss the soft keyboard (crucial for MOB-B2 keyboard occlusion).
   */
  async hideKeyboard(): Promise<void> {
    await this.step('Dismiss software keyboard', async () => {
      if (await driver.isKeyboardShown()) {
        try {
          await driver.hideKeyboard();
        } catch {
          // Fallback: tap outside or send back key on Android
          if (driver.isAndroid) {
            await driver.back();
          }
        }
      }
    });
  }

  /**
   * Perform vertical upward swipe / scroll down gesture using W3C pointer actions.
   */
  async swipeUp(distanceMultiplier = 0.5): Promise<void> {
    await this.step(`Swipe up gesture (scroll down by multiplier ${distanceMultiplier})`, async () => {
      const { width, height } = await driver.getWindowSize();
      const startX = Math.floor(width / 2);
      const startY = Math.floor(height * 0.75);
      const endY = Math.floor(height * (0.75 - distanceMultiplier));

      await driver.performActions([
        {
          type: 'pointer',
          id: 'finger1',
          parameters: { pointerType: 'touch' },
          actions: [
            { type: 'pointerMove', duration: 0, x: startX, y: startY },
            { type: 'pointerDown', button: 0 },
            { type: 'pause', duration: 200 },
            { type: 'pointerMove', duration: 600, x: startX, y: Math.max(10, endY) },
            { type: 'pointerUp', button: 0 },
          ],
        },
      ]);
      await driver.releaseActions();
    });
  }

  /**
   * Perform vertical downward swipe / scroll up gesture using W3C pointer actions.
   */
  async swipeDown(distanceMultiplier = 0.5): Promise<void> {
    await this.step(`Swipe down gesture (scroll up by multiplier ${distanceMultiplier})`, async () => {
      const { width, height } = await driver.getWindowSize();
      const startX = Math.floor(width / 2);
      const startY = Math.floor(height * 0.25);
      const endY = Math.floor(height * (0.25 + distanceMultiplier));

      await driver.performActions([
        {
          type: 'pointer',
          id: 'finger1',
          parameters: { pointerType: 'touch' },
          actions: [
            { type: 'pointerMove', duration: 0, x: startX, y: startY },
            { type: 'pointerDown', button: 0 },
            { type: 'pause', duration: 200 },
            { type: 'pointerMove', duration: 600, x: startX, y: Math.min(height - 10, endY) },
            { type: 'pointerUp', button: 0 },
          ],
        },
      ]);
      await driver.releaseActions();
    });
  }

  /**
   * Scroll down until target text element is visible.
   */
  async scrollToText(text: string, maxSwipes = 5): Promise<void> {
    await this.step(`Scroll to element containing text: "${text}"`, async () => {
      for (let i = 0; i < maxSwipes; i++) {
        const selector = driver.isAndroid
          ? `android=new UiSelector().textContains("${text}")`
          : `ios=type == 'XCUIElementTypeStaticText' AND label CONTAINS '${text}'`;
        const el = await $(selector);
        if (await el.isDisplayed().catch(() => false)) {
          return;
        }
        await this.swipeUp(0.4);
        await driver.pause(500);
      }
      throw new Error(`Failed to scroll to element containing text: "${text}" within ${maxSwipes} swipes`);
    });
  }

  /**
   * Perform two-finger pinch gesture (pinch in/zoom out if scale < 1, pinch out/zoom in if scale > 1).
   */
  async pinch(scale = 0.8): Promise<void> {
    await this.step(`Pinch gesture (scale: ${scale})`, async () => {
      const { width, height } = await driver.getWindowSize();
      const centerX = Math.floor(width / 2);
      const centerY = Math.floor(height / 2);
      const distance = Math.floor(Math.min(width, height) * 0.3);

      const f1StartX = centerX;
      const f1StartY = centerY - distance;
      const f2StartX = centerX;
      const f2StartY = centerY + distance;

      const f1EndY = centerY - Math.floor(distance * scale);
      const f2EndY = centerY + Math.floor(distance * scale);

      await driver.performActions([
        {
          type: 'pointer',
          id: 'finger1',
          parameters: { pointerType: 'touch' },
          actions: [
            { type: 'pointerMove', duration: 0, x: f1StartX, y: f1StartY },
            { type: 'pointerDown', button: 0 },
            { type: 'pause', duration: 100 },
            { type: 'pointerMove', duration: 600, x: f1StartX, y: f1EndY },
            { type: 'pointerUp', button: 0 },
          ],
        },
        {
          type: 'pointer',
          id: 'finger2',
          parameters: { pointerType: 'touch' },
          actions: [
            { type: 'pointerMove', duration: 0, x: f2StartX, y: f2StartY },
            { type: 'pointerDown', button: 0 },
            { type: 'pause', duration: 100 },
            { type: 'pointerMove', duration: 600, x: f2StartX, y: f2EndY },
            { type: 'pointerUp', button: 0 },
          ],
        },
      ]);
      await driver.releaseActions();
    });
  }

  /**
   * Set device orientation ('PORTRAIT' or 'LANDSCAPE').
   */
  async setOrientation(orientation: 'PORTRAIT' | 'LANDSCAPE'): Promise<void> {
    await this.step(`Set device orientation to ${orientation}`, async () => {
      await driver.setOrientation(orientation);
      await driver.pause(1000);
    });
  }

  /**
   * Get current device orientation.
   */
  async getOrientation(): Promise<string> {
    return driver.getOrientation();
  }

  /**
   * Background the application for a specified number of seconds and resume.
   */
  async background(seconds = 5): Promise<void> {
    await this.step(`Background application for ${seconds} seconds`, async () => {
      await driver.background(seconds);
    });
  }
}
