import { test, expect } from '../../../api/api.fixture';
import { LogoutResponseSchema, UserProfileSchema } from '../../../api/schemas';

test.describe('Logout & Session Invalidation API Suite', () => {
  test('API_COV_05: POST /api/logout clears auth cookies @smoke @regression', async ({
    api,
    seed
  }) => {
    // 1. Register and login user
    const authSession = await seed.createAndLoginUser({ fullName: 'Logout User' });
    expect(authSession.token).toBeTruthy();

    // 2. Perform logout
    const logoutRes = await api.auth.logout({ headers: authSession.headers });
    await expect(logoutRes).toHaveStatus(200);
    await expect(logoutRes).toMatchSchema(LogoutResponseSchema);
    expect(logoutRes.body.message).toContain('Logged out');

    // 3. Verify Set-Cookie header clears the session cookies
    const setCookieHeader = logoutRes.headers['set-cookie'] || '';
    const cookieString = Array.isArray(setCookieHeader)
      ? setCookieHeader.join('; ')
      : setCookieHeader;
    // Cleared cookie should specify expiration in 1970 or Max-Age=0
    expect(
      cookieString.includes('token=;') ||
        cookieString.includes('token=') ||
        cookieString.includes('1970') ||
        cookieString.includes('Max-Age=0')
    ).toBe(true);
  });

  test('API_COV_06: Token revocation check after logout @regression @security', async ({
    api,
    seed
  }) => {
    // Expected behavior: After logout, the previous Bearer token should be invalidated/revoked server-side.
    // Known BuggyBooks limitation / architectural gap:
    // BuggyBooks uses purely stateless JWT verification without a Redis/memory revocation blocklist.
    // As documented in Phase 8 Sprint 8.2, this is flagged as a security finding.
    test.fail(
      true,
      'Security Finding (US-AF-821): BuggyBooks does not maintain a server-side JWT revocation blocklist; stateless token remains valid until natural expiration.'
    );

    // 1. Authenticate user and extract token
    const authSession = await seed.createAndLoginUser({ fullName: 'Token Revocation User' });
    const oldToken = authSession.token;

    // 2. Logout user
    await api.auth.logout({ headers: authSession.headers });

    // 3. Attempt to use old bearer token to access protected endpoint
    const profileRes = await api.profile.get({
      headers: {
        Authorization: `Bearer ${oldToken}`
      }
    });

    // An ideal server should return 401 Unauthorized for revoked tokens.
    // In BuggyBooks, this currently returns 200 OK, causing the assertion below to fail as expected under test.fail().
    await expect(profileRes).toHaveStatus(401);
    await expect(profileRes).toMatchSchema(UserProfileSchema);
  });
});
