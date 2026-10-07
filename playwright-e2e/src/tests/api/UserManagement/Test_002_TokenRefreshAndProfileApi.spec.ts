import { test, expect } from '../../../api/api.fixture';
import { envConfig } from '../../../config/env.config';
import { CommonFunctions } from '@automationframeworks/playwright-utils';
import TestData from '../../../test-data/api/UserManagement/Test_002_TokenRefreshAndProfileApi.json';
import { randomBytes } from 'crypto';
import { createApiClient } from '../../../api/clients';
import {
  AuthTokensResponseSchema,
  ApiErrorResponseSchema,
  TestConfigPostResponseSchema
} from '../../../api/schemas';

const commonUtil = new CommonFunctions();

function uniqueUsername(prefix: string = 'tokenuser'): string {
  return `${prefix}_${Date.now()}_${randomBytes(4).toString('hex')}`;
}

test.describe('Token Refresh and Profile Upload API Suite', () => {
  test('API_REF_01: Dynamic Access Token Expiry @smoke @regression @chaos', async ({ api }) => {
    const username = uniqueUsername('token_exp');
    const password = TestData.PASSWORD;
    const fullName = TestData.FULL_NAME;

    try {
      const regRes = await api.auth.register({ username, password, fullName });
      await expect(regRes).toHaveStatus(201);
      await expect(regRes).toMatchSchema(AuthTokensResponseSchema);
      expect(regRes.status).toBe(201);

      const configRes = await api.testControl.setConfig({ jwtExpirySeconds: 2 });
      await expect(configRes).toHaveStatus(200);
      await expect(configRes).toMatchSchema(TestConfigPostResponseSchema);
      expect(configRes.status).toBe(200);

      const loginRes = await api.auth.login({ username, password });
      await expect(loginRes).toHaveStatus(200);
      await expect(loginRes).toMatchSchema(AuthTokensResponseSchema);
      expect(loginRes.status).toBe(200);

      const setCookieHeaders = loginRes.raw
        .headersArray()
        .filter((h) => h.name.toLowerCase() === 'set-cookie');
      const cookieHeader = setCookieHeaders.map((c) => c.value.split(';')[0]).join('; ');

      // Poll cart endpoint until short-lived access token expires and yields 403 Forbidden
      let protectedRes = await api.cart.get({
        headers: { Cookie: cookieHeader }
      });
      await expect
        .poll(
          async () => {
            protectedRes = await api.cart.get({
              headers: { Cookie: cookieHeader }
            });
            return protectedRes.status;
          },
          {
            message: 'Waiting for short-lived access token to expire and return 403 Forbidden',
            timeout: 10_000,
            intervals: [250, 500]
          }
        )
        .toBe(403);

      await commonUtil.logMessage('INFO', 'Verifying 403 Forbidden returned for expired token');
      await expect(protectedRes).toHaveStatus(403);
      await expect(protectedRes).toMatchSchema(ApiErrorResponseSchema);
      expect(protectedRes.status).toBe(403);
    } finally {
      await api.testControl.setConfig({ jwtExpirySeconds: 900 });
    }
  });

  test('API_REF_02: Refresh Token Issuance @smoke @regression', async ({ api }) => {
    const username = uniqueUsername('ref_issue');
    const password = TestData.PASSWORD;
    const fullName = TestData.FULL_NAME;

    const regRes = await api.auth.register({ username, password, fullName });
    await expect(regRes).toHaveStatus(201);
    await expect(regRes).toMatchSchema(AuthTokensResponseSchema);
    expect(regRes.status).toBe(201);

    const loginRes = await api.auth.login({ username, password });
    await expect(loginRes).toHaveStatus(200);
    await expect(loginRes).toMatchSchema(AuthTokensResponseSchema);
    expect(loginRes.status).toBe(200);

    const setCookieHeaders = loginRes.raw
      .headersArray()
      .filter((h) => h.name.toLowerCase() === 'set-cookie');
    const setCookieStr = setCookieHeaders.map((h) => h.value).join('; ');

    await commonUtil.logMessage('INFO', 'Verifying Set-Cookie contains access token');
    expect(setCookieStr.includes('token=')).toBe(true);

    await commonUtil.logMessage('INFO', 'Verifying Set-Cookie contains refresh token');
    expect(setCookieStr.includes('refreshToken=')).toBe(true);

    await commonUtil.logMessage('INFO', 'Verifying Set-Cookie includes HttpOnly security flag');
    expect(setCookieStr.toLowerCase().includes('httponly')).toBe(true);
  });

  test('API_REF_03: Silent Token Refresh @regression', async ({ api }) => {
    const username = uniqueUsername('silent_ref');
    const password = TestData.PASSWORD;
    const fullName = TestData.FULL_NAME;

    const regRes = await api.auth.register({ username, password, fullName });
    await expect(regRes).toHaveStatus(201);
    await expect(regRes).toMatchSchema(AuthTokensResponseSchema);
    expect(regRes.status).toBe(201);

    const loginRes = await api.auth.login({ username, password });
    await expect(loginRes).toHaveStatus(200);
    await expect(loginRes).toMatchSchema(AuthTokensResponseSchema);
    expect(loginRes.status).toBe(200);

    const setCookieHeaders = loginRes.raw
      .headersArray()
      .filter((h) => h.name.toLowerCase() === 'set-cookie');
    const refreshCookie = setCookieHeaders.find((c) => c.value.startsWith('refreshToken='));
    const refreshTokenHeader = refreshCookie ? refreshCookie.value.split(';')[0] : '';

    const refreshRes = await api.auth.refresh(undefined, {
      headers: { Cookie: refreshTokenHeader }
    });

    await commonUtil.logMessage('INFO', 'Verifying POST /api/auth/refresh returns 200 OK');
    await expect(refreshRes).toHaveStatus(200);
    await expect(refreshRes).toMatchSchema(AuthTokensResponseSchema);
    expect(refreshRes.status).toBe(200);

    const refreshSetCookieHeaders = refreshRes.raw
      .headersArray()
      .filter((h) => h.name.toLowerCase() === 'set-cookie');
    const refreshSetCookieStr = refreshSetCookieHeaders.map((h) => h.value).join('; ');

    await commonUtil.logMessage('INFO', 'Verifying new access token issued in Set-Cookie');
    expect(refreshSetCookieStr.includes('token=')).toBe(true);
  });

  test('API_UPL_01: Unauthorized Session Check @regression', async ({ playwright }) => {
    const unauthContext = await playwright.request.newContext({
      baseURL: envConfig.apiBaseUrl,
      storageState: { cookies: [], origins: [] },
      extraHTTPHeaders: {
        'x-bypass-csrf': 'true'
      }
    });
    const unauthApi = createApiClient(unauthContext);
    const uploadRes = await unauthApi.profile.uploadAvatar({
      name: 'avatar.png',
      mimeType: 'image/png',
      buffer: Buffer.from('mock-avatar-bytes')
    });
    const status = uploadRes.status;
    await unauthContext.dispose();

    await commonUtil.logMessage(
      'INFO',
      'Verifying 401 Unauthorized for unauthenticated upload request'
    );
    await expect(uploadRes).toHaveStatus(401);
    await expect(uploadRes).toMatchSchema(ApiErrorResponseSchema);
    expect(status).toBe(401);
  });
});
