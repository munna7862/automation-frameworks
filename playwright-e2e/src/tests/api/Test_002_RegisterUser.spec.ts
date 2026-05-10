import { test, expect } from '@playwright/test';
import { envConfig } from '../../config/env.config';
import apiUtil from '../../utils/api.util';
import { CommonFunctions } from '../../utils/common.util';

const commonUtil = new CommonFunctions();
const REGISTER_URL = `${envConfig.apiBaseUrl}/api/register`;

type RegisterPayload = {
  username?: string;
  password?: string;
  fullName?: string;
};

function buildValidPayload(overrides: RegisterPayload = {}): RegisterPayload {
  const uniqueId = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  return {
    username: `johndoe${uniqueId}@`,
    password: 'johna123@',
    fullName: 'john doe',
    ...overrides,
  };
}

async function registerUser(payload: RegisterPayload, logMessage: string) {
  return apiUtil.makeRequest({
    method: 'POST',
    url: REGISTER_URL,
    data: payload,
    headers: { 'Content-Type': 'application/json' },
    logMessage,
    responseType: 'full',
  });
}

async function validateSuccessfulRegisterContract(responseData: any, expectedUsername: string) {
  await commonUtil.compareTwoValues(typeof responseData, 'object', 'Registration response is an object');
  await commonUtil.compareTwoValues(responseData !== null, true, 'Registration response is not null');
  await commonUtil.compareTwoValues(typeof responseData?.message, 'string', 'Message is a string');
  await commonUtil.compareTwoValues(typeof responseData?.username, 'string', 'Username is a string');
  await commonUtil.compareTwoValues(responseData?.message, 'Registration successful', 'Registration message');
  await commonUtil.compareTwoValues(responseData?.username, expectedUsername, 'Registered username matches request');
  await commonUtil.compareTwoValues(
    JSON.stringify(Object.keys(responseData ?? {}).sort()),
    JSON.stringify(['message', 'username']),
    'Response contains only expected contract fields'
  );

  expect(responseData).toEqual({
    message: 'Registration successful',
    username: expectedUsername,
  });
}

test.describe('Register User API - Positive, Negative, Contract and Security', () => {
  test('Testcase 1: Positive: POST /api/register should register a new user successfully', async () => {
    const payload = buildValidPayload();
    const response = await registerUser(payload, 'Register a new valid user');

    await commonUtil.compareTwoValues(response.status, 201, 'Response status');
    expect(response.status).toBe(201);

    await validateSuccessfulRegisterContract(response.data, payload.username as string);
  });

  const missingFieldScenarios: { description: string; payload: RegisterPayload }[] = [
    { description: 'missing username', payload: { password: 'johna123@', fullName: 'john doe' } },
    { description: 'missing password', payload: { username: `missingpass${Date.now()}@`, fullName: 'john doe' } },
    { description: 'empty username', payload: { username: '', password: 'johna123@', fullName: 'john doe' } },
    { description: 'empty password', payload: { username: `emptypass${Date.now()}@`, password: '', fullName: 'john doe' } },
  ];

  for (const scenario of missingFieldScenarios) {
    test(`Testcase 2: Negative: POST /api/register should reject ${scenario.description}`, async () => {
      const response = await registerUser(scenario.payload, `Register user with ${scenario.description}`);

      await commonUtil.compareTwoValues([400, 422].includes(response.status), true, `Status code for ${scenario.description}`);
      expect([400, 422]).toContain(response.status);
      expect(response.data).toBeTruthy();
      expect(response.data?.password).toBeUndefined();
    });
  }

  test('Testcase 3: Negative: POST /api/register should reject duplicate usernames', async () => {
    const payload = buildValidPayload();
    const firstResponse = await registerUser(payload, 'Register original user for duplicate validation');
    const duplicateResponse = await registerUser(payload, 'Register duplicate username');

    await commonUtil.compareTwoValues(firstResponse.status, 201, 'Initial registration response status');
    await commonUtil.compareTwoValues([400, 409, 422].includes(duplicateResponse.status), true, 'Duplicate registration status');
    expect(firstResponse.status).toBe(201);
    expect([400, 409, 422]).toContain(duplicateResponse.status);
    expect(duplicateResponse.data?.password).toBeUndefined();
  });

  test('Testcase 4: Negative: GET /api/register should not be allowed for user registration', async () => {
    const response = await apiUtil.makeRequest({
      method: 'GET',
      url: REGISTER_URL,
      headers: { 'Content-Type': 'application/json' },
      logMessage: 'Attempt register endpoint with unsupported GET method',
      responseType: 'full',
    });

    await commonUtil.compareTwoValues([404, 405].includes(response.status), true, 'Unsupported method status');
    expect([404, 405]).toContain(response.status);
  });

  const securityPayloads: { description: string; payload: RegisterPayload }[] = [
    {
      description: 'SQL injection pattern in username',
      payload: buildValidPayload({ username: `' OR '1'='1${Date.now()}@` }),
    },
    {
      description: 'script tag in fullName',
      payload: buildValidPayload({ fullName: '<script>alert("xss")</script>' }),
    },
    {
      description: 'oversized username',
      payload: buildValidPayload({ username: `${'a'.repeat(260)}@` }),
    },
  ];

  for (const scenario of securityPayloads) {
    test(`Testcase 5: Security: POST /api/register should handle ${scenario.description} without server error or sensitive leakage`, async () => {
      const response = await registerUser(scenario.payload, `Security validation for ${scenario.description}`);

      await commonUtil.compareTwoValues(response.status < 500, true, `Security status for ${scenario.description}`);
      expect(response.status).toBeLessThan(500);
      expect(response.data?.password).toBeUndefined();
      expect(JSON.stringify(response.data ?? {})).not.toContain('<script>');
    });
  }

  test('Testcase 6: Security: POST /api/register should reject unsupported content type', async () => {
    const response = await apiUtil.makeRequest({
      method: 'POST',
      url: REGISTER_URL,
      data: JSON.stringify(buildValidPayload()),
      headers: { 'Content-Type': 'text/plain' },
      logMessage: 'Register user with unsupported content type',
      responseType: 'full',
    });

    await commonUtil.compareTwoValues([400, 415].includes(response.status), true, 'Unsupported content type status');
    expect([400, 415]).toContain(response.status);
  });
});
