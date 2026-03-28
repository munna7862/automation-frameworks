import * as dotenv from 'dotenv';

dotenv.config();

export const envConfig = {
  env: process.env.ENV || 'qa',
  baseUrl: "https://automationexercise.com/",
  githubUrl: "https://github.com/",
  apiBaseUrl: process.env.API_BASE_URL!,
  postsBaseUrl: process.env.POSTS_BASE_URL || 'https://jsonplaceholder.typicode.com',
  headless: process.env.HEADLESS === 'true',
  browser: process.env.BROWSER || 'chromium',
  USE_SPECIFIC_TESTS: true,
  SUITENAME: process.env.SUITENAME || 'Default'
};
