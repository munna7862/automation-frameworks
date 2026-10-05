import type { ChainablePromiseElement } from 'webdriverio';
import { BasePage } from '@core/base/base.page';
import { envConfig } from '@config/env.config';

export class CheckoutPage extends BasePage {
  private static readonly DEFAULT_SHIPPING_ADDRESS = '123 Buggy Lane';
  private static readonly DEFAULT_SHIPPING_CITY = 'Stack City';
  public static readonly DEFAULT_TEST_CARD = '4532015112830366';

  // Step 1: Shipping Locators
  private get inputFirstName(): ChainablePromiseElement {
    return $('input[name="txt_f1"], input[name="firstName"]');
  }

  private get inputLastName(): ChainablePromiseElement {
    return $('input[name="txt_f2"], input[name="lastName"]');
  }

  private get inputShippingAddress(): ChainablePromiseElement {
    return $('input[name="txt_addr_12"], input[placeholder="123 Buggy Lane"]');
  }

  private get inputCity(): ChainablePromiseElement {
    return $('input[name="txt_city_34"], input[placeholder="Stack City"]');
  }

  // Step 2: Payment Locators
  private get inputCardNumber(): ChainablePromiseElement {
    return $(
      'input[name="creditCard"], input[name="txt_c99"], input[placeholder="16-digit card number"]'
    );
  }

  private get inputExpiry(): ChainablePromiseElement {
    return $('input[name="txt_exp_56"], input[placeholder="MM/YY"]');
  }

  private get inputCvv(): ChainablePromiseElement {
    return $('input[name="txt_cvv_78"], input[placeholder="3 digits"]');
  }

  // Wizard Navigation
  private get btnNextStep(): ChainablePromiseElement {
    return $('button#wizard-next-btn');
  }

  private get btnFinalSubmit(): ChainablePromiseElement {
    return $('//button[contains(normalize-space(), "Complete Payment") or @name="btn_submit_rnd"]');
  }

  private get btnBackStep(): ChainablePromiseElement {
    return $('button#wizard-back-btn');
  }

  // Shadow DOM Host Element
  private get orderSummaryHost(): ChainablePromiseElement {
    return $('order-summary-box');
  }

  // Confirmation Locators
  private get eleOrderConfirmation(): ChainablePromiseElement {
    return $('main');
  }

  // Navigation
  public async navigateToCheckout(): Promise<void> {
    await this.logMessage('INFO', `Navigating to checkout: ${envConfig.baseUrl}/checkout`);
    await browser.url(`${envConfig.baseUrl}/checkout`);
    await this.waitForVisible(this.inputFirstName);
  }

  // Step 1: Shipping Actions
  public async enterFirstName(firstName: string): Promise<void> {
    await this.clearAndSetInputValue(this.inputFirstName, firstName);
  }

  public async enterLastName(lastName: string): Promise<void> {
    await this.clearAndSetInputValue(this.inputLastName, lastName);
  }

  public async enterShippingAddress(address: string): Promise<void> {
    await this.clearAndSetInputValue(this.inputShippingAddress, address);
  }

  public async enterCity(city: string): Promise<void> {
    await this.clearAndSetInputValue(this.inputCity, city);
  }

  public async fillShippingDetails(
    firstName: string,
    lastName: string,
    address = CheckoutPage.DEFAULT_SHIPPING_ADDRESS,
    city = CheckoutPage.DEFAULT_SHIPPING_CITY
  ): Promise<void> {
    await this.logMessage('INFO', `Entering shipping details for ${firstName} ${lastName}`);
    await this.enterFirstName(firstName);
    await this.enterLastName(lastName);
    await this.enterShippingAddress(address);
    await this.enterCity(city);
    await this.clickNextStep();
    await this.inputCardNumber.waitForDisplayed({ timeout: 15000 }).catch(() => undefined);
  }

  public async isPaymentStepVisible(): Promise<boolean> {
    return await this.inputCardNumber
      .waitForDisplayed({ timeout: 15000 })
      .then(() => true)
      .catch(() => false);
  }

  // Step 2: Payment Actions
  public async enterCardNumber(cardNumber: string): Promise<void> {
    await this.clearAndSetInputValue(this.inputCardNumber, cardNumber);
  }

  public async enterExpiry(expiry: string): Promise<void> {
    await this.clearAndSetInputValue(this.inputExpiry, expiry);
  }

  public async enterCvv(cvv: string): Promise<void> {
    await this.clearAndSetInputValue(this.inputCvv, cvv);
  }

  public async fillPaymentDetails(
    cardNumber: string,
    expiry = '12/30',
    cvv = '123'
  ): Promise<void> {
    await this.logMessage('INFO', 'Entering payment details');
    await this.enterCardNumber(cardNumber);
    await this.enterExpiry(expiry);
    await this.enterCvv(cvv);
  }

  // Wizard Stepper Controls
  public async clickNextStep(): Promise<void> {
    await this.doClick(this.btnNextStep, 'Clicking Next Step button in checkout wizard');
  }

  public async clickBackStep(): Promise<void> {
    await this.doClick(this.btnBackStep, 'Clicking Back Step button in checkout wizard');
  }

  public async clickCompletePayment(): Promise<void> {
    // Dismiss any overlapping promo toasts / floating banners
    await browser.execute(() => {
      try {
        document
          .querySelectorAll('div[role="status"], .react-hot-toast, [class*="toast"]')
          .forEach((el) => el.remove());
      } catch {
        // ignore
      }
    });

    const nextBtn = $('button#wizard-next-btn');
    if (await nextBtn.isDisplayed().catch(() => false)) {
      await this.doClick(nextBtn, 'Clicking Next Step button in checkout wizard');
      await browser.pause(1000);
    }

    const submitBtn = $(
      'button.primary-x2, button.submit-action-btn, button[name="btn_submit_rnd"]'
    );
    await submitBtn.waitForDisplayed({ timeout: 15000 });
    await submitBtn.scrollIntoView();

    try {
      await submitBtn.waitForClickable({ timeout: 5000 });
      await submitBtn.click();
    } catch {
      await this.logMessage(
        'INFO',
        'Clicking submit button via JS execute to bypass floating overlay'
      );
      await browser.execute(
        (el) => {
          (el as HTMLElement).click();
        },
        await submitBtn
      );
    }
  }

  public async clickFinalSubmit(): Promise<void> {
    await this.clickCompletePayment();
  }

  // Shadow DOM Piercing Actions (<order-summary-box>)
  public async isOrderSummaryBoxPresent(): Promise<boolean> {
    return await this.orderSummaryHost.isDisplayed().catch(() => false);
  }

  public async getOrderSummaryTotal(): Promise<string> {
    await this.logMessage('INFO', 'Piercing Shadow DOM to extract total from <order-summary-box>');
    await this.orderSummaryHost.waitForDisplayed({ timeout: 15000 });
    const shadowTotal = this.orderSummaryHost.shadow$(
      '.total-amount, .summary-total, .summary-box, p'
    );
    await shadowTotal.waitForDisplayed({ timeout: 15000 });
    const total = await shadowTotal.getText();
    await this.logMessage('INFO', `Extracted Shadow DOM summary total: ${total}`);
    return total;
  }

  public async getOrderSummarySubtotal(): Promise<string> {
    await this.logMessage(
      'INFO',
      'Piercing Shadow DOM to extract subtotal from <order-summary-box>'
    );
    await this.orderSummaryHost.waitForDisplayed({ timeout: 15000 });
    const shadowSubtotal = this.orderSummaryHost.shadow$('.subtotal, .total-amount, .summary-box');
    await shadowSubtotal.waitForDisplayed({ timeout: 15000 });
    return await shadowSubtotal.getText();
  }

  public async getOrderSummaryTax(): Promise<string> {
    await this.logMessage('INFO', 'Piercing Shadow DOM to extract tax from <order-summary-box>');
    await this.orderSummaryHost.waitForDisplayed({ timeout: 15000 });
    const shadowTax = this.orderSummaryHost.shadow$('.tax, .total-amount, .summary-box');
    await shadowTax.waitForDisplayed({ timeout: 15000 });
    return await shadowTax.getText();
  }

  // Order Placement & Confirmation
  public async placeOrder(): Promise<void> {
    await this.clickFinalSubmit();
  }

  public async isOrderConfirmed(): Promise<boolean> {
    const text = await $('main')
      .getText()
      .catch(() => '');
    return text.includes('Payment Successful') || text.includes('Thank you for your order');
  }

  public async placeOrderAndConfirm(maxAttempts: number = 3): Promise<string> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      if (await this.isOrderConfirmed()) {
        const text = await $('main').getText();
        return text.replace(/\s+/g, ' ').trim();
      }

      await this.clickCompletePayment();

      const confirmed = await browser
        .waitUntil(
          async () => {
            return await this.isOrderConfirmed();
          },
          {
            timeout: 20000,
            interval: 1000
          }
        )
        .catch(() => false);

      if (confirmed) {
        const text = await $('main').getText();
        return text.replace(/\s+/g, ' ').trim();
      }

      if (attempt < maxAttempts) {
        await this.logMessage(
          'WARN',
          `Order confirmation not visible after 20s on attempt ${attempt}. Retrying submit...`
        );
        await browser.pause(2000);
      }
    }

    const text = await $('main').getText();
    return text.replace(/\s+/g, ' ').trim();
  }

  public async getOrderConfirmationMessage(): Promise<string> {
    if (await this.isOrderConfirmed()) {
      const text = await $('main').getText();
      return text.replace(/\s+/g, ' ').trim();
    }
    return await this.placeOrderAndConfirm();
  }

  public async isOrderConfirmationVisible(): Promise<boolean> {
    return await this.isOrderConfirmed();
  }

  public async completePaymentSuccessfully(
    firstName: string,
    lastName: string,
    cardNumber: string,
    expectedMessage = 'Payment Successful'
  ): Promise<void> {
    await this.fillShippingDetails(firstName, lastName);
    await this.fillPaymentDetails(cardNumber);

    // If next button exists on payment step to proceed to confirmation step
    if (await this.btnNextStep.isDisplayed().catch(() => false)) {
      await this.clickNextStep();
    }

    // Submit payment
    await this.clickFinalSubmit();

    // Verify confirmation
    await browser.waitUntil(
      async () => {
        const text = await this.eleOrderConfirmation.getText().catch(() => '');
        return text.includes(expectedMessage) || text.includes('Thank you for your order');
      },
      {
        timeout: 30000,
        timeoutMsg: `Expected confirmation containing "${expectedMessage}" but timed out`
      }
    );
  }
}
