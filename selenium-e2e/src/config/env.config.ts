import * as dotenv from 'dotenv';
import { validateEnvConfig, ENV_PROFILES, TargetEnv } from '@automationframeworks/test-data';

dotenv.config();

const validated = validateEnvConfig(process.env, { exitOnError: true });

export const PROFILES = ENV_PROFILES;
export type TargetProfileKey = TargetEnv;

export const envConfig = {
  env: validated.ENV,
  baseUrl: validated.baseUrl,
  apiBaseUrl: validated.apiBaseUrl,
  apiUrl: validated.apiUrl || `${validated.apiBaseUrl}/api`,
  headless: validated.headless,
  browser: validated.browser,
  timeout: validated.timeout,
  SUITENAME: validated.SUITENAME
};

export const getLoginCredentials = () => ({
  userName: validated.userName,
  password: validated.password
});
