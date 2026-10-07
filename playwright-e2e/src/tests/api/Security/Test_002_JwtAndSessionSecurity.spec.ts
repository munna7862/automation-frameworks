import { test, expect } from '../../../core/base/security.fixture';
import { envConfig } from '../../../config/env.config';
import {
  createNoneAlgorithmToken,
  createKidTamperedToken,
  createTamperedPayloadToken
} from '@automationframeworks/test-data';
import { randomBytes } from 'crypto';

test.describe('SEC-AUTH: JWT & Session Security Suite', () => {
  test.beforeEach(async () => {
    test.skip(
      envConfig.env !== 'DOCKER',
      'Attack payloads only permitted on disposable DOCKER environment'
    );
  });

  test.afterEach(async ({ api }) => {
    await api.testControl.reset();
  });

  test('SEC-AUTH-01: alg: none token rejected on protected endpoints @security @owasp-api2 @owasp-a07', async ({
    securityApi
  }) => {
    const noneToken = createNoneAlgorithmToken('attacker');

    const res = await securityApi.profile.get({
      headers: { Authorization: `Bearer ${noneToken}` },
      expectStatus: [401, 403]
    });

    expect([401, 403]).toContain(res.status);
    expect(res.data).toBeDefined();
  });

  test('SEC-AUTH-02: Tampered kid header token rejected on protected endpoints @security @owasp-api2 @owasp-a07', async ({
    securityApi
  }) => {
    const kidToken = await createKidTamperedToken('attacker', '../../../../dev/null');

    const res = await securityApi.profile.get({
      headers: { Authorization: `Bearer ${kidToken}` },
      expectStatus: [401, 403]
    });

    expect([401, 403]).toContain(res.status);
  });

  test('SEC-AUTH-03: Tampered payload with retained valid signature rejected @security @owasp-api2 @owasp-a07', async ({
    securityApi
  }) => {
    const rawUsername = `sec_user_${Date.now()}_${randomBytes(3).toString('hex')}@test.local`;
    const password = 'SecPassWord123!';

    const regRes = await securityApi.auth.register({
      username: rawUsername,
      password,
      fullName: 'Legit User'
    });
    expect(regRes.status).toBe(201);
    const validToken = regRes.data.token;

    // Tamper the payload username to target another user while retaining signature
    const tamperedToken = createTamperedPayloadToken(validToken, { username: 'admin' });

    const res = await securityApi.profile.get({
      headers: { Authorization: `Bearer ${tamperedToken}` },
      expectStatus: [401, 403]
    });

    expect([401, 403]).toContain(res.status);
  });

  test('SEC-AUTH-04: Token reuse after logout rejected or flagged as stateless finding @security @owasp-api2 @owasp-a07', async ({
    securityApi
  }) => {
    const username = `logout_user_${Date.now()}_${randomBytes(3).toString('hex')}@test.local`;
    const password = 'SecPassWord123!';

    const regRes = await securityApi.auth.register({
      username,
      password,
      fullName: 'Logout Test User'
    });
    expect(regRes.status).toBe(201);
    const userToken = regRes.data.token;

    // Perform explicit logout
    const logoutRes = await securityApi.auth.logout({
      headers: { Authorization: `Bearer ${userToken}` }
    });
    expect([200, 204]).toContain(logoutRes.status);

    // Attempt reuse of the token after logout
    const accessRes = await securityApi.profile.get({
      headers: { Authorization: `Bearer ${userToken}` },
      expectStatus: [200, 401, 403]
    });

    // In stateless JWT architectures without a token revocation blacklist, the token remains valid until expiry.
    // As specified in US-AF-921, if not rejected, mark test.fail with finding annotation.
    if (accessRes.status === 200) {
      test.fail(
        true,
        'AppSec Finding: Stateless JWT token was accepted after /api/logout (no token revocation blacklist implemented)'
      );
    }
    expect([401, 403]).toContain(accessRes.status);
  });

  test('SEC-AUTH-05: Refresh-token rotation prevents reuse of expired or already consumed refresh token @security @owasp-api2 @owasp-a07', async ({
    securityApi
  }) => {
    const username = `refresh_user_${Date.now()}_${randomBytes(3).toString('hex')}@test.local`;
    const password = 'SecPassWord123!';

    const regRes = await securityApi.auth.register({
      username,
      password,
      fullName: 'Refresh Test User'
    });
    expect(regRes.status).toBe(201);
    const initialRefreshToken = regRes.data.refreshToken;

    // Use refresh token once to get new token pair
    const refresh1 = await securityApi.auth.refresh({
      refreshToken: initialRefreshToken
    });
    expect([200, 201]).toContain(refresh1.status);

    // Replay the old refresh token (should be rejected after rotation)
    const replayRes = await securityApi.auth.refresh(
      { refreshToken: initialRefreshToken },
      { expectStatus: [200, 400, 401, 403] }
    );

    if (replayRes.status === 200) {
      test.fail(
        true,
        'AppSec Finding: Refresh token rotation not enforced — consumed refresh token re-accepted'
      );
    }
    expect([400, 401, 403]).toContain(replayRes.status);
  });

  test('SEC-AUTH-06: Plaintext password is never echoed in auth and profile responses @security @owasp-api2 @owasp-a07', async ({
    securityApi
  }) => {
    const username = `echo_user_${Date.now()}_${randomBytes(3).toString('hex')}@test.local`;
    const secretPassword = 'P@ssw0rdSuperSecret!';

    const regRes = await securityApi.auth.register({
      username,
      password: secretPassword,
      fullName: 'Echo Test User'
    });
    expect(regRes.status).toBe(201);
    expect(JSON.stringify(regRes.data)).not.toContain(secretPassword);

    const loginRes = await securityApi.auth.login({
      username,
      password: secretPassword
    });
    expect(loginRes.status).toBe(200);
    expect(JSON.stringify(loginRes.data)).not.toContain(secretPassword);

    const profileRes = await securityApi.profile.get({
      headers: { Authorization: `Bearer ${loginRes.data.token}` }
    });
    expect(profileRes.status).toBe(200);
    expect(JSON.stringify(profileRes.data)).not.toContain(secretPassword);
  });

  test('SEC-AUTH-07: Error message parity prevents username enumeration on login @security @owasp-api2 @owasp-a07', async ({
    securityApi
  }) => {
    const validUsername = `enum_user_${Date.now()}_${randomBytes(3).toString('hex')}@test.local`;
    const validPassword = 'CorrectPassword123!';

    await securityApi.auth.register({
      username: validUsername,
      password: validPassword,
      fullName: 'Enum User'
    });

    // Case A: Existing user, incorrect password
    const wrongPasswordRes = await securityApi.auth.login(
      { username: validUsername, password: 'WrongPassword999!' },
      { expectStatus: [400, 401] }
    );

    // Case B: Non-existent user
    const unknownUserRes = await securityApi.auth.login(
      { username: `does_not_exist_${Date.now()}@test.local`, password: 'SomePassword123!' },
      { expectStatus: [400, 401] }
    );

    expect(wrongPasswordRes.status).toBe(unknownUserRes.status);
    expect((wrongPasswordRes.data as any).message || (wrongPasswordRes.data as any).error).toBe(
      (unknownUserRes.data as any).message || (unknownUserRes.data as any).error
    );
  });
});
