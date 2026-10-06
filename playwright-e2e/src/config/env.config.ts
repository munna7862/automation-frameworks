import * as dotenv from 'dotenv';

dotenv.config();

export const PROFILES = {
  DOCKER: { baseUrl: 'http://localhost:5173', apiBaseUrl: 'http://localhost:4000' },
  STAGING: {
    baseUrl: 'https://buggy-books-fe.onrender.com',
    apiBaseUrl: 'https://buggy-books.onrender.com'
  },
  INTEROP: {
    baseUrl: 'https://buggy-books-fe.onrender.com',
    apiBaseUrl: 'https://buggy-books.onrender.com'
  }
} as const;

type TargetProfileKey = keyof typeof PROFILES;

const rawEnvKey = (
  process.env.TARGET_ENV ||
  process.env.ENV ||
  'DOCKER'
).toUpperCase() as TargetProfileKey;
const currentProfile = PROFILES[rawEnvKey] || PROFILES.DOCKER;

// Normalized URLs with profile defaults and explicit env overrides
const rawBaseUrl =
  process.env.E2E_BASE_URL ||
  process.env.BASE_URL ||
  process.env.STAGING_URL ||
  currentProfile.baseUrl;

const rawApiUrl = process.env.E2E_API_URL || process.env.API_BASE_URL || currentProfile.apiBaseUrl;

// Strip trailing slash or /api for consistent baseURL joining
const normalizedApiBase = rawApiUrl.replace(/\/api\/?$/, '').replace(/\/+$/, '');
const normalizedBaseUrl = rawBaseUrl.replace(/\/+$/, '');

export const envConfig = {
  env: rawEnvKey,
  baseUrl: normalizedBaseUrl,
  apiBaseUrl: normalizedApiBase,
  apiUrl: `${normalizedApiBase}/api`,
  headless:
    process.env.HEADLESS === 'true' || process.env.HEADLESS === undefined
      ? true
      : process.env.HEADLESS === 'true',
  browser: process.env.BROWSER || 'chromium',
  timeout: parseInt(process.env.ELEMENT_TIMEOUT || '15000', 10),
  SUITENAME: process.env.SUITENAME || 'Default'
};

const DEFAULT_SEED_FALLBACKS: Record<string, string> = {
  BASE_URL: 'http://127.0.0.1:5173',
  E2E_BASE_URL: 'http://127.0.0.1:5173',
  STAGING_URL: 'http://127.0.0.1:5173',
  API_BASE_URL: 'http://127.0.0.1:4000',
  E2E_API_URL: 'http://127.0.0.1:4000/api',
  USER_NAME: 'admin',
  PASSWORD: 'password123',
  E2E_USER_NAME: 'admin',
  E2E_USER_EMAIL: 'admin',
  E2E_USER_PASSWORD: 'password123'
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
  userName:
    process.env.E2E_USER_NAME || process.env.E2E_USER_EMAIL || process.env.USER_NAME || 'admin',
  password: process.env.E2E_USER_PASSWORD || process.env.PASSWORD || 'password123'
});
