import * as dotenv from 'dotenv';

dotenv.config();

export const envConfig = {
  env: process.env.ENV || 'qa',
  baseUrl: process.env.BASE_URL!,
  apiBaseUrl: process.env.API_BASE_URL!,
  headless: process.env.HEADLESS === 'true',
  browser: process.env.BROWSER || 'chromium'
};
