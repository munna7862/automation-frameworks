import { test, expect } from '../../../api/api.fixture';
import { CommonFunctions } from '@automationframeworks/playwright-utils';
import TestData from '../../../test-data/api/Logging/Test_001_LoggingAndCorrelationApi.json';
import { randomBytes } from 'crypto';
import {
  BookListSchema,
  ApiErrorResponseSchema,
  AuthTokensResponseSchema,
  CartSchema,
  CheckoutResponseSchema
} from '../../../api/schemas';

const commonUtil = new CommonFunctions();

function uniqueUsername(prefix: string = 'loguser'): string {
  return `${prefix}_${Date.now()}_${randomBytes(4).toString('hex')}`;
}

test.describe('Structured JSON Logging & Correlation ID API Suite', () => {
  test('API_LOG_01: Correlation ID Header Generation @smoke @regression', async ({ api }) => {
    const res = await api.books.list();
    await expect(res).toHaveStatus(200);
    await expect(res).toMatchSchema(BookListSchema);
    expect(res.status).toBe(200);

    const correlationId = res.headers['x-correlation-id'] || res.raw.headers()['x-correlation-id'];
    await commonUtil.logMessage('INFO', 'Verifying x-correlation-id header is present in response');
    expect(correlationId).toBeDefined();

    const uuidRegex = new RegExp(TestData.UUIDV4_REGEX, 'i');
    await commonUtil.logMessage('INFO', 'Verifying x-correlation-id matches valid UUIDv4 format');
    expect(uuidRegex.test(correlationId || '')).toBe(true);
  });

  test('API_LOG_02: Correlation ID Header Preservation @regression', async ({ api }) => {
    const customCorrelationId = TestData.CUSTOM_CORRELATION_ID;

    const res = await api.books.list(undefined, {
      headers: { 'x-correlation-id': customCorrelationId }
    });

    await expect(res).toHaveStatus(200);
    await expect(res).toMatchSchema(BookListSchema);
    expect(res.status).toBe(200);

    const returnedCorrelationId =
      res.headers['x-correlation-id'] || res.raw.headers()['x-correlation-id'];
    await commonUtil.logMessage('INFO', 'Verifying API preserves custom x-correlation-id header');
    expect(returnedCorrelationId).toBe(customCorrelationId);
  });

  test('API_LOG_03: Error Body Correlation ID Mapping @regression', async ({ api }) => {
    const customCorrelationId = TestData.CUSTOM_CORRELATION_ID + '_err';

    const res = await api.testControl.setConfig(
      { visualChaos: 'invalid_string_type' },
      { headers: { 'x-correlation-id': customCorrelationId } }
    );

    await commonUtil.logMessage('INFO', 'Verifying status code is 400 Bad Request');
    await expect(res).toHaveStatus(400);
    await expect(res).toMatchSchema(ApiErrorResponseSchema);
    expect(res.status).toBe(400);

    const body = res.body as { correlationId?: string };
    const bodyCorrelationId = body?.correlationId;
    await commonUtil.logMessage(
      'INFO',
      'Verifying error response body contains exact same correlationId'
    );
    expect(bodyCorrelationId).toBe(customCorrelationId);
  });

  test('API_LOG_04: User Context Log Association @regression', async ({ api }) => {
    const username = uniqueUsername('user_log');
    const password = TestData.PASSWORD;
    const fullName = TestData.FULL_NAME;
    const customCorrelationId = TestData.CUSTOM_CORRELATION_ID + '_user_flow';

    const registerRes = await api.auth.register(
      { username, password, fullName },
      { headers: { 'x-correlation-id': customCorrelationId } }
    );
    await commonUtil.logMessage('INFO', 'Verifying user registration status is 201');
    await expect(registerRes).toHaveStatus(201);
    await expect(registerRes).toMatchSchema(AuthTokensResponseSchema);
    expect(registerRes.status).toBe(201);

    const loginRes = await api.auth.login(
      { username, password },
      { headers: { 'x-correlation-id': customCorrelationId } }
    );
    await commonUtil.logMessage('INFO', 'Verifying user login status is 200');
    await expect(loginRes).toHaveStatus(200);
    await expect(loginRes).toMatchSchema(AuthTokensResponseSchema);
    expect(loginRes.status).toBe(200);

    const cartRes = await api.cart.add('1', {
      headers: { 'x-correlation-id': customCorrelationId }
    });
    await commonUtil.logMessage('INFO', 'Verifying add to cart status is 200');
    await expect(cartRes).toHaveStatus(200);
    await expect(cartRes).toMatchSchema(CartSchema);
    expect(cartRes.status).toBe(200);

    const checkoutRes = await api.checkout.process(
      { firstName: 'LogUser', lastName: 'Test', creditCard: '4111222233334444' },
      { headers: { 'x-correlation-id': customCorrelationId } }
    );
    await commonUtil.logMessage('INFO', 'Verifying process checkout status is 200');
    await expect(checkoutRes).toHaveStatus(200);
    await expect(checkoutRes).toMatchSchema(CheckoutResponseSchema);
    expect(checkoutRes.status).toBe(200);

    const returnedCorrelationId =
      checkoutRes.headers['x-correlation-id'] || checkoutRes.raw.headers()['x-correlation-id'];
    await commonUtil.logMessage('INFO', 'Verifying correlation ID preserved in checkout response');
    expect(returnedCorrelationId).toBe(customCorrelationId);
  });
});
