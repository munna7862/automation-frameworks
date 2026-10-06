import { test, expect } from '../../../api/api.fixture';
import { CommonFunctions } from '@automationframeworks/playwright-utils';
import TestData from '../../../test-data/api/ChaosAndTesting/Test_002_VisualChaosApi.json';
import {
  TestConfigPostResponseSchema,
  ChaosConfigSchema,
  ApiErrorResponseSchema,
  TestResetResponseSchema
} from '../../../api/schemas';

const commonUtil = new CommonFunctions();

test.describe('Visual Chaos Configuration API Suite', () => {
  test('API_VIS_01: Toggle visualChaos Config via API @smoke @regression @chaos', async ({
    api
  }) => {
    try {
      const configRes = await api.testControl.setConfig(TestData.TOGGLE_PAYLOAD);
      await expect(configRes).toHaveStatus(200);
      await expect(configRes).toMatchSchema(TestConfigPostResponseSchema);
      const data = configRes.body;

      await commonUtil.logMessage('INFO', 'Verifying POST /api/test/config status is 200');
      expect(configRes.status).toBe(200);

      await commonUtil.logMessage('INFO', 'Verifying visualChaos field is true in response config');
      expect(data.config.visualChaos).toBe(true);
    } finally {
      await api.testControl.setConfig({ visualChaos: false });
    }
  });

  test('API_VIS_02: Default visualChaos is False @smoke @regression', async ({ api }) => {
    const resetRes = await api.testControl.reset();
    await expect(resetRes).toHaveStatus(200);
    await expect(resetRes).toMatchSchema(TestResetResponseSchema);
    expect(resetRes.status).toBe(200);

    const configRes = await api.testControl.getConfig();
    await expect(configRes).toHaveStatus(200);
    await expect(configRes).toMatchSchema(ChaosConfigSchema);
    const data = configRes.body;

    await commonUtil.logMessage('INFO', 'Verifying GET /api/test/config status is 200');
    expect(configRes.status).toBe(200);

    await commonUtil.logMessage('INFO', 'Verifying visualChaos default value is false');
    expect(data.visualChaos).toBe(false);
  });

  test('API_VIS_03: Invalid Type Rejected @regression', async ({ api }) => {
    const configRes = await api.testControl.setConfig(TestData.INVALID_TYPE_PAYLOAD);

    await commonUtil.logMessage('INFO', 'Verifying 400 Bad Request returned for invalid data type');
    await expect(configRes).toHaveStatus(400);
    await expect(configRes).toMatchSchema(ApiErrorResponseSchema);
    expect(configRes.status).toBe(400);

    const errorData = configRes.body;
    const errorText = JSON.stringify(errorData).toLowerCase();
    const isValidErr =
      errorText.includes('expected boolean') ||
      errorText.includes('invalid') ||
      errorText.includes('validation failed') ||
      errorText.includes('bad request');
    expect(isValidErr).toBe(true);
  });

  test('API_VIS_04: Combine with Other Chaos Params @regression @chaos', async ({ api }) => {
    try {
      const configRes = await api.testControl.setConfig(TestData.COMBINED_PAYLOAD);
      await expect(configRes).toHaveStatus(200);
      await expect(configRes).toMatchSchema(TestConfigPostResponseSchema);
      const data = configRes.body;

      await commonUtil.logMessage('INFO', 'Verifying POST /api/test/config status is 200');
      expect(configRes.status).toBe(200);

      await commonUtil.logMessage('INFO', 'Verifying visualChaos saved as true');
      expect(data.config.visualChaos).toBe(true);

      await commonUtil.logMessage('INFO', 'Verifying checkoutFailureRate saved as 0.5');
      expect(data.config.checkoutFailureRate).toBe(0.5);
    } finally {
      await api.testControl.setConfig(TestData.RESET_PAYLOAD);
    }
  });
});
