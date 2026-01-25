import { test, expect } from '@playwright/test';
import { AuthService } from '@services/auth.service';

const authService = new AuthService();

test('Login API should return token', async () => {
  const token = await authService.login(
    'eve.holt@reqres.in',
    'cityslicka'
  );

  expect(token).toBeDefined();
  expect(typeof token).toBe('string');
});
