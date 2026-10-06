import { TEST_CARD_NUMBERS } from '../constants/test-cards';
import { faker } from '../faker/seedable-faker';

export interface CheckoutDetails {
  firstName: string;
  lastName: string;
  creditCard: string;
  /** Alias for UI form compatibility */
  cardNumber: string;
  shippingAddress: string;
  city: string;
  expiry: string;
  cvv: string;
}

export class CheckoutDetailsFactory {
  /**
   * Generates safe, synthetic checkout details using only dedicated test card numbers.
   * Never generates real PII or live payment numbers.
   */
  public static build(overrides: Partial<CheckoutDetails> = {}): CheckoutDetails {
    const firstName = overrides.firstName ?? faker.person.firstName();
    const lastName = overrides.lastName ?? faker.person.lastName();
    const card = overrides.creditCard ?? overrides.cardNumber ?? TEST_CARD_NUMBERS.VALID_VISA;

    return {
      firstName,
      lastName,
      creditCard: card,
      cardNumber: card,
      shippingAddress: overrides.shippingAddress ?? '123 Buggy Lane',
      city: overrides.city ?? 'Stack City',
      expiry: overrides.expiry ?? '12/30',
      cvv: overrides.cvv ?? '123'
    };
  }

  /**
   * Builds checkout details explicitly configured with an invalid card for negative testing.
   */
  public static buildInvalid(overrides: Partial<CheckoutDetails> = {}): CheckoutDetails {
    return this.build({
      creditCard: TEST_CARD_NUMBERS.INVALID_NUMBER,
      cardNumber: TEST_CARD_NUMBERS.INVALID_NUMBER,
      ...overrides
    });
  }
}
