import * as dotenv from 'dotenv';
import { validateEnvConfig, ENV_PROFILES, TargetEnv } from '@automationframeworks/test-data';

dotenv.config();

// Fast-fail validation via zod schema
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

const DEFAULT_SEED_FALLBACKS: Record<string, string> = {
  BASE_URL: 'http://127.0.0.1:5173',
  E2E_BASE_URL: 'http://127.0.0.1:5173',
  STAGING_URL: 'http://127.0.0.1:5173',
  API_BASE_URL: 'http://127.0.0.1:4000',
  E2E_API_URL: 'http://127.0.0.1:4000/api',
  USER_NAME: validated.userName,
  PASSWORD: validated.password,
  E2E_USER_NAME: validated.userName,
  E2E_USER_EMAIL: validated.userName,
  E2E_USER_PASSWORD: validated.password
};

export const getRequiredEnv = (key: string, fallback?: string): string => {
  const value = process.env[key] || fallback || DEFAULT_SEED_FALLBACKS[key];

  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}. Add it to playwright-e2e/.env locally or configure it as a GitHub Actions secret.`
    );
  }

  return value;
};

export const getLoginCredentials = () => ({
  userName: validated.userName,
  password: validated.password
});
