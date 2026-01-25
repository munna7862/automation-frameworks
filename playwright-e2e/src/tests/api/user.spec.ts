import { test, expect } from '@playwright/test';
import { UserService } from '@services/user.service';

const userService = new UserService();

test('Get user by id', async () => {
  const response = await userService.getUser(2);

  expect(response.status).toBe(200);
  expect(response.data.data.id).toBe(2);
});

test('Create user', async () => {
  const response = await userService.createUser({
    name: 'Munna',
    job: 'Senior SDET'
  });

  expect(response.status).toBe(201);
  expect(response.data.name).toBe('Munna');
});
