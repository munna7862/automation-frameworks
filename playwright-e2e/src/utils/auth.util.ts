import { BrowserContext } from '@playwright/test';

export class AuthUtil {
  static async injectToken(
    context: BrowserContext,
    token: string
  ) {
    await context.addInitScript((authToken) => {
      window.localStorage.setItem('auth_token', authToken);
    }, token);
  }
}
