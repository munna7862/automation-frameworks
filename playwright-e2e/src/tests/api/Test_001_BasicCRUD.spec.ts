import { test, expect } from '@playwright/test';
import apiUtil from '../../utils/api.util';
import { CommonFunctions } from '../../utils/common.util';

const POSTS_BASE_URL = 'https://jsonplaceholder.typicode.com/posts';
const commonUtil = new CommonFunctions();

// Shared type for JSONPlaceholder Post resource
interface Post {
  userId: number;
  id?: number;
  title: string;
  body: string;
}

test.describe('Posts API - CRUD Operations @api', () => {

  test.describe('1. READ operations', () => {

    test('Testcase 1. GET /posts - should return all posts with status 200', async () => {
      const response = await apiUtil.makeRequest({
        method: 'GET',
        url: POSTS_BASE_URL,
        logMessage: 'Get all posts',
        responseType: 'full',
      });

      await commonUtil.compareTwoValues(response.status, 200, 'Response status');

      const isArray = Array.isArray(response.data);
      await commonUtil.compareTwoValues(isArray, true, `Response data is array (length: ${response.data.length})`);

      await commonUtil.compareTwoValues(response.data.length > 0, true, `Response has posts (length: ${response.data.length})`);

      const firstPost = response.data[0];
      for (const prop of ['userId', 'id', 'title', 'body']) {
        const hasProp = firstPost && Object.prototype.hasOwnProperty.call(firstPost, prop);
        await commonUtil.compareTwoValues(hasProp, true, `First post has property '${prop}'`);
      }
    });

    test('Testcase 2. GET /posts/:id - should return a single post by id', async () => {
      const postId = 1;
      const response = await apiUtil.makeRequest({
        method: 'GET',
        url: `${POSTS_BASE_URL}/${postId}`,
        logMessage: `Get post by id ${postId}`,
        responseType: 'full',
      });

      await commonUtil.compareTwoValues(response.status, 200, 'Response status');

      await commonUtil.compareTwoValues(response.data?.id, postId, 'Post id');
      const hasRequiredKeys = response.data && typeof response.data.userId === 'number' && typeof response.data.title === 'string' && typeof response.data.body === 'string';
      await commonUtil.compareTwoValues(hasRequiredKeys, true, `Post has userId, title, body with correct types (userId: ${response.data?.userId}, title: ${typeof response.data?.title}, body: ${typeof response.data?.body})`);
      expect.soft(response.data).toMatchObject({
        id: postId,
        userId: expect.any(Number),
        title: expect.any(String),
        body: expect.any(String),
      });
    });

    test('Testcase 3. GET /posts/:id - should return 404 for non-existent post id', async () => {
      const nonExistentId = 99999;
      const response = await apiUtil.makeRequest({
        method: 'GET',
        url: `${POSTS_BASE_URL}/${nonExistentId}`,
        logMessage: `Get non-existent post ${nonExistentId}`,
        responseType: 'full',
      });

      await commonUtil.compareTwoValues(response.success === false, true, `Error response success flag (success: ${response.success})`);
      await commonUtil.compareTwoValues(Number(response.status), 404, `Response status is 404 (status: ${response.status})`);
    });
  });

  test.describe('2. CREATE operation', () => {

    test('Testcase 1. POST /posts - should create a new post and return 201', async () => {
      const newPost: Post = {
        userId: 1,
        title: 'E2E test post title',
        body: 'E2E test post body content for API automation.',
      };

      const response = await apiUtil.makeRequest({
        method: 'POST',
        url: POSTS_BASE_URL,
        data: newPost,
        logMessage: 'Create new post',
        responseType: 'full',
      });

      await commonUtil.compareTwoValues(response.status, 201, 'Response status');

      await commonUtil.compareTwoValues(response.data?.title, newPost.title, 'Response title');
      await commonUtil.compareTwoValues(response.data?.body, newPost.body, 'Response body');
      await commonUtil.compareTwoValues(response.data?.userId, newPost.userId, 'Response userId');

      const hasId = response.data?.id != null;
      await commonUtil.compareTwoValues(hasId, true, `Response has id (id: ${response.data?.id})`);
    });
  });

  test.describe('3. UPDATE operations', () => {

    test('Testcase 1. PUT /posts/:id - should fully update a post and return 200', async () => {
      const postId = 1;
      const updatedPost: Post = {
        userId: 1,
        title: 'Updated title via PUT',
        body: 'Updated body content via PUT.',
      };

      const response = await apiUtil.makeRequest({
        method: 'PUT',
        url: `${POSTS_BASE_URL}/${postId}`,
        data: updatedPost,
        logMessage: `PUT update post ${postId}`,
        responseType: 'full',
      });

      await commonUtil.compareTwoValues(response.status, 200, 'Response status');

      await commonUtil.compareTwoValues(response.data?.id, postId, 'Updated post id');
      await commonUtil.compareTwoValues(response.data?.title, updatedPost.title, 'Updated post title');
      await commonUtil.compareTwoValues(response.data?.body, updatedPost.body, 'Updated post body');
      await commonUtil.compareTwoValues(response.data?.userId, updatedPost.userId, 'Updated post userId');
      expect.soft(response.data).toMatchObject({
        id: postId,
        title: updatedPost.title,
        body: updatedPost.body,
        userId: updatedPost.userId,
      });
    });

    test('Testcase 2. PATCH /posts/:id - should partially update a post and return 200', async () => {
      const postId = 1;
      const partialUpdate = { title: 'Only title updated via PATCH' };

      const response = await apiUtil.makeRequest({
        method: 'PATCH',
        url: `${POSTS_BASE_URL}/${postId}`,
        data: partialUpdate,
        logMessage: `PATCH update post ${postId}`,
        responseType: 'full',
      });

      await commonUtil.compareTwoValues(response.status, 200, 'Response status');

      await commonUtil.compareTwoValues(response.data?.id, postId, 'Patched post id');
      await commonUtil.compareTwoValues(response.data?.title, partialUpdate.title, 'Patched post title');

      const bodyDefined = response.data?.body !== undefined && response.data?.body !== null;
      await commonUtil.compareTwoValues(bodyDefined, true, 'Patched post body is defined');

      const userIdDefined = response.data?.userId !== undefined && response.data?.userId !== null;
      await commonUtil.compareTwoValues(userIdDefined, true, 'Patched post userId is defined');
    });
  });

  test.describe('4. DELETE operation', () => {

    test('Testcase 1. DELETE /posts/:id - should delete a post and return 200', async () => {
      const postId = 1;
      const response = await apiUtil.makeRequest({
        method: 'DELETE',
        url: `${POSTS_BASE_URL}/${postId}`,
        logMessage: `Delete post ${postId}`,
        responseType: 'full',
      });

      await commonUtil.compareTwoValues(response.status, 200, 'Delete response status');
    });
  });

  test.describe('5. CRUD flow (Create -> Read -> Update -> Delete)', () => {

    test('Testcase 1. should complete full CRUD lifecycle', async () => {
      const newPost: Post = {
        userId: 1,
        title: 'CRUD flow test title',
        body: 'CRUD flow test body.',
      };

      // CREATE
      const createResponse = await apiUtil.makeRequest({
        method: 'POST',
        url: POSTS_BASE_URL,
        data: newPost,
        logMessage: 'Create post in CRUD flow',
        responseType: 'full',
      });
      await commonUtil.compareTwoValues(createResponse.status, 201, 'CREATE response status');

      const createdId = createResponse.data.id;
      await commonUtil.compareTwoValues(createdId != null, true, `CREATE returned id (id: ${createdId})`);
      await commonUtil.compareTwoValues(createResponse.data?.title, newPost.title, 'CREATE response title');

      // JSONPlaceholder simulates creation; validate by reading an existing post
      const getResponse = await apiUtil.makeRequest({
        method: 'GET',
        url: `${POSTS_BASE_URL}/1`,
        logMessage: 'Read existing post in CRUD flow',
        responseType: 'full',
      });
      await commonUtil.compareTwoValues(getResponse.status, 200, 'READ response status');
      await commonUtil.compareTwoValues(getResponse.data?.id, 1, 'READ post id');

      // UPDATE (PATCH)
      const updatedTitle = 'CRUD flow - updated title';
      const patchResponse = await apiUtil.makeRequest({
        method: 'PATCH',
        url: `${POSTS_BASE_URL}/1`,
        data: { title: updatedTitle },
        logMessage: 'Patch post in CRUD flow',
        responseType: 'full',
      });
      await commonUtil.compareTwoValues(patchResponse.status, 200, 'PATCH response status');
      await commonUtil.compareTwoValues(patchResponse.data?.title, updatedTitle, 'PATCH title updated');

      // DELETE
      const deleteResponse = await apiUtil.makeRequest({
        method: 'DELETE',
        url: `${POSTS_BASE_URL}/1`,
        logMessage: 'Delete post in CRUD flow',
        responseType: 'full',
      });
      await commonUtil.compareTwoValues(deleteResponse.status, 200, 'DELETE response status');
    });
  });
});
