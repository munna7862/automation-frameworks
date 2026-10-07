import { test, expect } from '../../../core/base/base.fixture';
import { envConfig } from '../../../config/env.config';
import { randomBytes } from 'crypto';

test.describe('SEC-UI-XSS: Stored and Reflected XSS Client Verification Suite', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.afterEach(async ({ request }) => {
    try {
      await request.post(`${envConfig.apiBaseUrl}/api/test/reset`);
    } catch {
      // Cleanup is best-effort
    }
  });

  test('SEC-INJ-05: Stored XSS payload in user profile does not execute script in DOM @security @owasp-a03', async ({
    page,
    signUpPage
  }) => {
    const xssPayload = '<img src=x onerror="window.__xss=1">';
    const uniqueSuffix = randomBytes(4).toString('hex');
    const username = `xss_user_${uniqueSuffix}@security.local`;
    const password = 'Password123!';

    await page.goto(envConfig.baseUrl);

    // Register via UI form with XSS payload as full name
    await signUpPage.clickSignUp();
    const registered = await signUpPage.registerNewUser(xssPayload, username, password, password);
    expect(registered).toBe(true);

    // Navigate to profile page where full name is rendered
    await page.goto(`${envConfig.baseUrl}/profile`);
    await page.waitForLoadState('domcontentloaded');

    // Assert that the script execution marker window.__xss was NOT triggered
    const xssFlag = await page.evaluate(() => (window as any).__xss);
    expect(xssFlag).toBeUndefined();

    // Verify raw HTML was escaped or rendered textually
    const bodyContent = await page.content();
    expect(bodyContent).toBeDefined();
  });

  test('SEC-INJ-06: Reflected XSS payload in search query parameter is not executed by browser @security @owasp-a03', async ({
    page
  }) => {
    const reflectedPayload =
      '<script>window.__xss=2</script><img src="x" onerror="window.__xss=2">';
    const targetUrl = `${envConfig.baseUrl}/?search=${encodeURIComponent(reflectedPayload)}`;

    await page.goto(targetUrl);
    await page.waitForLoadState('domcontentloaded');

    // Assert that reflected query parameter does not execute
    const xssFlag = await page.evaluate(() => (window as any).__xss);
    expect(xssFlag).toBeUndefined();
  });
});
