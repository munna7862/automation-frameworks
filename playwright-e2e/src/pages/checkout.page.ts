import { BasePage } from '../core/base/base.page';
import { expect, Locator, Page } from '@playwright/test';

export class CheckoutPage extends BasePage {
  private readonly checkoutSummary: Locator;
  private readonly firstNameInput: Locator;
  private readonly lastNameInput: Locator;
  private readonly cardNumberInput: Locator;
  private readonly completePaymentButton: Locator;
  private readonly orderConfirmationMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.checkoutSummary = this.page.getByRole('main');
    this.firstNameInput = this.page.locator('input[name="txt_f1"]');
    this.lastNameInput = this.page.locator('input[name="txt_f2"]');
    this.cardNumberInput = this.page.locator('input[name="txt_c99"]');
    this.completePaymentButton = this.page.getByRole('button', { name: 'Complete Payment' });
    this.orderConfirmationMessage = this.page.getByRole('main');
  }

  public async getOrderTotalAmountText(): Promise<string> {
    await this.logMessage('INFO', "Getting checkout order total amount");
    await this.checkoutSummary.waitFor({ state: 'visible', timeout: 60000 });
    await this.logMessage('INFO', "Checkout summary is visible, retrieving total amount text is: " + (await this.checkoutSummary.textContent() ?? ''));
    return await this.checkoutSummary.textContent() ?? '';
  }

  public async waitForOrderTotalAmount(expectedTotal: string): Promise<void> {
    await this.logMessage('INFO', `Waiting for checkout order total amount: ${expectedTotal}`);
    await expect(this.checkoutSummary).toContainText(expectedTotal, { timeout: 60000 });
  }

  public async enterFirstName(firstName: string): Promise<void> {
    await this.doEnterText(this.firstNameInput, firstName, `Entering first name: ${firstName}`);
  }

  public async enterLastName(lastName: string): Promise<void> {
    await this.doEnterText(this.lastNameInput, lastName, `Entering last name: ${lastName}`);
  }

  public async enterCardNumber(cardNumber: string): Promise<void> {
    await this.doEnterText(this.cardNumberInput, cardNumber, "Entering card number");
  }

  public async clickCompletePayment(): Promise<void> {
    await this.doClick(this.completePaymentButton, "Clicking on Complete Payment button");
  }

  public async getOrderConfirmationMessage(): Promise<string> {
    await this.logMessage('INFO', "Getting order confirmation message");
    await this.orderConfirmationMessage.waitFor({ state: 'visible', timeout: 60000 });
    return await this.doGetText(this.orderConfirmationMessage, "Getting order confirmation message");
  }

  public async waitForOrderConfirmationMessage(expectedMessage: string): Promise<void> {
    await this.logMessage('INFO', `Waiting for order confirmation message: ${expectedMessage}`);
    await expect(this.orderConfirmationMessage).toContainText(expectedMessage, { timeout: 60000 });
  }

  public async completePaymentSuccessfully(firstName: string, lastName: string, cardNumber: string, expectedMessage: string, maxAttempts: number = 3): Promise<void> {
    await this.enterFirstName(firstName);
    await this.enterLastName(lastName);
    await this.enterCardNumber(cardNumber);

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      await this.clickCompletePayment();

      try {
        await expect(this.orderConfirmationMessage).toContainText(expectedMessage, { timeout: 15000 });
        await this.logMessage('INFO', "Payment completed successfully and order confirmation message is displayed.");
        return;
      } catch (error: unknown) {
        if (attempt === maxAttempts) {
          throw error;
        }
        await this.logMessage('WARN', `Payment attempt ${attempt} did not complete successfully. Retrying payment.`);
      }
    }
  }
}
