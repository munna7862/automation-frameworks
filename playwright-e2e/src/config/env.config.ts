import * as dotenv from 'dotenv';

dotenv.config();

export const envConfig = {
  env: process.env.ENV || 'qa',
  baseUrl: process.env.BASE_URL || "https://buggy-books-fe.onrender.com/",
  buggyBooksUrl: process.env.BUGGY_BOOKS_URL || "https://buggy-books-fe.onrender.com/",
  githubUrl: "https://github.com/",
  apiBaseUrl: process.env.API_BASE_URL!,
  postsBaseUrl: process.env.POSTS_BASE_URL || 'https://jsonplaceholder.typicode.com',
  headless: process.env.HEADLESS === 'true',
  browser: process.env.BROWSER || 'chrome',
  USE_SPECIFIC_TESTS: true,
  SUITENAME: process.env.SUITENAME || 'Default'
};
