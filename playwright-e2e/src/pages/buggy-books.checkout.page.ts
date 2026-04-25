import { BasePage } from '@core/base/base.page';
import { Locator } from '@playwright/test';

export class BuggyBooksCheckoutPage extends BasePage {
  private get lblCheckoutTitle(): Locator { return this.page.locator('heading', { hasText: 'Checkout' }); }
  private get lblSecureOrderSummary(): Locator { return this.page.locator('heading', { hasText: 'Secure Order Summary' }); }
  private get lblTotalToPay(): Locator { return this.page.locator('//div[@class="orderSummary"]//p | text=/Total to pay:/'); }
  private get inputFirstName(): Locator { return this.page.locator('input[name="firstName"], textbox >> nth=0'); }
  private get inputLastName(): Locator { return this.page.locator('input[name="lastName"], textbox >> nth=1'); }
  private get inputCreditCard(): Locator { return this.page.locator('input[name="creditCard"], textbox >> nth=2'); }
  private get btnCompletePayment(): Locator { return this.page.locator('button:has-text("Complete Payment")'); }
  private get lblPaymentSuccessful(): Locator { return this.page.locator('heading', { hasText: 'Payment Successful' }); }
  private get lblThankYouMessage(): Locator { return this.page.locator('text=Thank you for your order'); }

  public async verifyCheckoutPageLoaded() {
    await this.logMessage('INFO', 'Verifying Checkout page is loaded');
    const isVisible = await this.doesElementExist(this.lblCheckoutTitle, 'Checking if Checkout heading is visible');
    if (!isVisible) {
      throw new Error('Checkout heading not found');
    }
    await this.logMessage('INFO', 'Checkout page loaded successfully');
  }

  public async verifyOrderSummaryDisplayed() {
    await this.logMessage('INFO', 'Verifying Order Summary is displayed');
    const isVisible = await this.doesElementExist(this.lblSecureOrderSummary, 'Checking if Secure Order Summary is visible');
    if (!isVisible) {
      throw new Error('Secure Order Summary heading not found');
    }
    await this.logMessage('INFO', 'Order Summary is displayed');
  }

  public async getTotalToPay(): Promise<string> {
    await this.logMessage('INFO', 'Getting total to pay amount');
    const totalText = await this.doGetText(this.lblTotalToPay, 'Getting total to pay text');
    const totalAmount = totalText.match(/\$[\d.]+/)?.[0] || '$0.00';
    await this.logMessage('INFO', `Total to pay: ${totalAmount}`);
    return totalAmount;
  }

  public async fillCheckoutForm(firstName: string, lastName: string, creditCard: string) {
    await this.logMessage('INFO', 'Filling checkout form');
    await this.doEnterText(this.inputFirstName, firstName, `Entering first name: ${firstName}`);
    await this.doEnterText(this.inputLastName, lastName, `Entering last name: ${lastName}`);
    await this.doEnterText(this.inputCreditCard, creditCard, `Entering credit card: ****${creditCard.slice(-4)}`);
    await this.logMessage('INFO', 'Checkout form filled successfully');
  }

  public async completePayment() {
    await this.logMessage('INFO', 'Completing payment');
    await this.doClick(this.btnCompletePayment, 'Clicking Complete Payment button');
    await this.logMessage('INFO', 'Payment completed');
  }

  public async verifyPaymentSuccessful() {
    await this.logMessage('INFO', 'Verifying payment was successful');
    
    // Wait for success message with timeout
    await this.page.waitForTimeout(2000);
    
    const isSuccessVisible = await this.doesElementExist(this.lblPaymentSuccessful, 'Checking if Payment Successful message is visible');
    const isThankYouVisible = await this.doesElementExist(this.lblThankYouMessage, 'Checking if Thank you message is visible');
    
    if (!isSuccessVisible && !isThankYouVisible) {
      throw new Error('Payment success message not found');
    }
    await this.logMessage('INFO', 'Payment was successful - verification passed');
  }

  public async verifyCheckoutFormFieldsExist() {
    await this.logMessage('INFO', 'Verifying checkout form fields exist');
    
    const firstNameExists = await this.doesElementExist(this.inputFirstName, 'Checking if First Name field exists');
    const lastNameExists = await this.doesElementExist(this.inputLastName, 'Checking if Last Name field exists');
    const creditCardExists = await this.doesElementExist(this.inputCreditCard, 'Checking if Credit Card field exists');
    
    if (!firstNameExists || !lastNameExists || !creditCardExists) {
      throw new Error('One or more checkout form fields not found');
    }
    await this.logMessage('INFO', 'All checkout form fields exist - verification passed');
  }
}
