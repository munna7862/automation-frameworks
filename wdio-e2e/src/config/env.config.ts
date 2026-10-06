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

const rawBaseUrl = process.env.E2E_BASE_URL || process.env.BASE_URL || currentProfile.baseUrl;

const rawApiUrl = process.env.E2E_API_URL || process.env.API_BASE_URL || currentProfile.apiBaseUrl;

const normalizedApiBase = rawApiUrl.replace(/\/api\/?$/, '').replace(/\/+$/, '');
const normalizedBaseUrl = rawBaseUrl.replace(/\/+$/, '');

export const envConfig = {
  env: rawEnvKey,
  baseUrl: normalizedBaseUrl,
  apiBaseUrl: normalizedApiBase,
  apiUrl: `${normalizedApiBase}/api`,
  headless: process.env.HEADLESS !== 'false',
  browser: process.env.BROWSER || 'chrome',
  timeout: parseInt(process.env.ELEMENT_TIMEOUT || '15000', 10),
  SUITENAME: process.env.SUITENAME || 'Default'
};

export const getLoginCredentials = () => ({
  userName:
    process.env.E2E_USER_NAME || process.env.E2E_USER_EMAIL || process.env.USER_NAME || 'admin',
  password: process.env.E2E_USER_PASSWORD || process.env.PASSWORD || 'password123'
});
