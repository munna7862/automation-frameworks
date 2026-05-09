import { test } from '@playwright/test';
import { envConfig } from '../../config/env.config';
import apiUtil from '../../utils/api.util';
import { CommonFunctions } from '../../utils/common.util';

const commonUtil = new CommonFunctions();
const BOOKS_URL = `${envConfig.apiBaseUrl}/api/books`;

async function validateBookContract(book: any) {
  await commonUtil.compareTwoValues(typeof book, 'object', 'Book entry is an object');
  await commonUtil.compareTwoValues(book !== null, true, 'Book entry is not null');
  await commonUtil.compareTwoValues(typeof book?.id, 'string', 'Book id is a string');
  await commonUtil.compareTwoValues(typeof book?.title, 'string', 'Book title is a string');
  await commonUtil.compareTwoValues(typeof book?.author, 'string', 'Book author is a string');
  await commonUtil.compareTwoValues(typeof book?.price, 'number', 'Book price is a number');
  await commonUtil.compareTwoValues(typeof book?.genre, 'string', 'Book genre is a string');
  await commonUtil.compareTwoValues(typeof book?.description, 'string', 'Book description is a string');
  await commonUtil.compareTwoValues(typeof book?.image, 'string', 'Book image is a string');
  return (
    typeof book?.id === 'string' &&
    typeof book?.title === 'string' &&
    typeof book?.author === 'string' &&
    typeof book?.price === 'number' &&
    typeof book?.genre === 'string' &&
    typeof book?.description === 'string' &&
    typeof book?.image === 'string'
  );
}

test.describe('Books API - List and Security', () => {
  let header: any;

  test.beforeAll(async () => {
    header = { 'Content-Type': 'application/json' };
  });

  test('Testcase 1: GET /api/books?page=1&limit=8 - should return a paged book list with valid contract for page 1', async () => {
    const response = await apiUtil.makeRequest({
      method: 'GET',
      url: `${BOOKS_URL}?page=1&limit=8`,
      headers: header,
      logMessage: 'Get paged books list',
      responseType: 'full',
    });

    await commonUtil.compareTwoValues(response.status, 200, 'Response status');
    await commonUtil.compareTwoValues(Array.isArray(response.data?.books), true, 'Books property is an array');
    await commonUtil.compareTwoValues(typeof response.data?.total, 'number', 'Total count is numeric');
    await commonUtil.compareTwoValues(typeof response.data?.page, 'number', 'Page is numeric');
    await commonUtil.compareTwoValues(typeof response.data?.totalPages, 'number', 'Total pages is numeric');
    await commonUtil.compareTwoValues(typeof response.data?.limit, 'number', 'Limit is numeric');
    await commonUtil.compareTwoValues(response.data?.page, 1, 'Returned page is 1');
    await commonUtil.compareTwoValues(response.data?.limit, 8, 'Returned limit is 8');

    const books = response.data?.books ?? [];
    await commonUtil.compareTwoValues(books.length > 0, true, `Books array contains ${books.length} entries`);

    const firstBook = books[0];
    await commonUtil.compareTwoValues(await validateBookContract(firstBook), true, 'First book payload matches contract');
    for (const book of books) {
      await commonUtil.compareTwoValues(await validateBookContract(book), true, `Book id ${book?.id} has expected contract`);
    }
  });

  test('Testcase 2: GET /api/books?page=2&limit=8 - should return a paged book list with valid contract for page 2', async () => {
    const response = await apiUtil.makeRequest({
      method: 'GET',
      url: `${BOOKS_URL}?page=2&limit=8`,
      headers: header,
      logMessage: 'Get books for page 2',
      responseType: 'full',
    });

    await commonUtil.compareTwoValues(response.status, 200, 'Response status');
    await commonUtil.compareTwoValues(Array.isArray(response.data?.books), true, 'Books property is an array');
    await commonUtil.compareTwoValues(typeof response.data?.total, 'number', 'Total count is numeric');
    await commonUtil.compareTwoValues(typeof response.data?.page, 'number', 'Page is numeric');
    await commonUtil.compareTwoValues(typeof response.data?.totalPages, 'number', 'Total pages is numeric');
    await commonUtil.compareTwoValues(typeof response.data?.limit, 'number', 'Limit is numeric');
    await commonUtil.compareTwoValues(response.data?.page, 2, 'Returned page is 2');
    await commonUtil.compareTwoValues(response.data?.limit, 8, 'Returned limit is 8');

    const books = response.data?.books ?? [];
    await commonUtil.compareTwoValues(books.length > 0, true, `Books array contains ${books.length} entries`);

    const firstBook = books[0];
    await commonUtil.compareTwoValues(await validateBookContract(firstBook), true, 'First book payload matches contract');
    for (const book of books) {
      await commonUtil.compareTwoValues(await validateBookContract(book), true, `Book id ${book?.id} has expected contract`);
    }
  });

});
