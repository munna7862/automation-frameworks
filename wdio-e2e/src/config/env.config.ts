import * as dotenv from 'dotenv';

dotenv.config();

const rawBaseUrl =
  process.env.E2E_BASE_URL || process.env.BASE_URL || 'https://buggy-books-fe.onrender.com';

const rawApiUrl =
  process.env.E2E_API_URL || process.env.API_BASE_URL || 'https://buggy-books.onrender.com/api';

const normalizedApiBase = rawApiUrl.replace(/\/api\/?$/, '').replace(/\/+$/, '');
const normalizedBaseUrl = rawBaseUrl.replace(/\/+$/, '');

export const envConfig = {
  env: process.env.ENV || 'staging',
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
