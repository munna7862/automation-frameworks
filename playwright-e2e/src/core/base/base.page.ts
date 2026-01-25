import { Page, expect } from '@playwright/test';

export class BasePage {
  constructor(protected page: Page) {}

  async click(selector: string) {
    await this.page.locator(selector).click();
  }

  async fill(selector: string, value: string) {
    await this.page.locator(selector).fill(value);
  }

  async assertVisible(selector: string) {
    await expect(this.page.locator(selector)).toBeVisible();
  }
}
