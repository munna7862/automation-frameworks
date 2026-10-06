/**
 * Standard test credit card numbers for BuggyBooks checkout automation.
 * These are strictly synthetic test cards and must never contain real PII or live payment numbers.
 */
export const TEST_CARD_NUMBERS = {
  /** Valid BuggyBooks Visa test card number */
  VALID_VISA: '4532111122223333',
  /** Valid BuggyBooks Mastercard test card number */
  VALID_MASTERCARD: '5425233430109903',
  /** Valid BuggyBooks Amex test card number */
  VALID_AMEX: '378282246310005',
  /** Card number guaranteed to trigger validation / gateway failure */
  INVALID_NUMBER: '4111111111111111',
  /** Card with too few digits (fails client-side validation) */
  SHORT_CARD: '12345678',
  /** Card with letters/symbols (fails numeric check) */
  ALPHANUMERIC: '4532ABCD22223333',
  /** Blank / empty card */
  EMPTY: ''
} as const;

export type TestCardType = keyof typeof TEST_CARD_NUMBERS;
