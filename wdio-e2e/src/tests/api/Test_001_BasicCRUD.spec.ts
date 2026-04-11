import { envConfig } from '@config/env.config';
import apiUtil from '@utils/api.util';
import { CommonFunctions } from '@utils/common.util';
import testData from '@test-data/api/Test_001_BasicCRUD.json';

const commonUtil = new CommonFunctions();
const POSTS_BASE_URL = `${envConfig.postsBaseUrl}${testData.resourcePath}`;

describe('Posts API - CRUD Operations', () => {
  describe('1. READ operations', () => {
    it('Testcase 1. GET /posts - should return all posts with status 200', async () => {
      const response = await apiUtil.makeRequest({
        method: 'GET',
        url: POSTS_BASE_URL,
        logMessage: 'Get all posts',
        responseType: 'full'
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

    it('Testcase 2. GET /posts/:id - should return a single post by id', async () => {
      const response = await apiUtil.makeRequest({
        method: 'GET',
        url: `${POSTS_BASE_URL}/${testData.existingPostId}`,
        logMessage: `Get post by id ${testData.existingPostId}`,
        responseType: 'full'
      });

      await commonUtil.compareTwoValues(response.status, 200, 'Response status');
      await commonUtil.compareTwoValues(response.data?.id, testData.existingPostId, 'Post id');
      await commonUtil.compareTwoValues(typeof response.data?.userId, 'number', 'Post userId type');
      await commonUtil.compareTwoValues(typeof response.data?.title, 'string', 'Post title type');
      await commonUtil.compareTwoValues(typeof response.data?.body, 'string', 'Post body type');
    });

    it('Testcase 3. GET /posts/:id - should return 404 for non-existent post id', async () => {
      const response = await apiUtil.makeRequest({
        method: 'GET',
        url: `${POSTS_BASE_URL}/${testData.nonExistentPostId}`,
        logMessage: `Get non-existent post ${testData.nonExistentPostId}`,
        responseType: 'full'
      });

      await commonUtil.compareTwoValues(response.success === false, true, `Error response success flag (success: ${response.success})`);
      await commonUtil.compareTwoValues(Number(response.status), 404, `Response status is 404 (status: ${response.status})`);
    });
  });

  describe('2. CREATE operation', () => {
    it('Testcase 1. POST /posts - should create a new post and return 201', async () => {
      const response = await apiUtil.makeRequest({
        method: 'POST',
        url: POSTS_BASE_URL,
        data: testData.createPost,
        logMessage: 'Create new post',
        responseType: 'full'
      });

      await commonUtil.compareTwoValues(response.status, 201, 'Response status');
      await commonUtil.compareTwoValues(response.data?.title, testData.createPost.title, 'Response title');
      await commonUtil.compareTwoValues(response.data?.body, testData.createPost.body, 'Response body');
      await commonUtil.compareTwoValues(response.data?.userId, testData.createPost.userId, 'Response userId');

      const hasId = response.data?.id != null;
      await commonUtil.compareTwoValues(hasId, true, `Response has id (id: ${response.data?.id})`);
    });
  });

  describe('3. UPDATE operations', () => {
    it('Testcase 1. PUT /posts/:id - should fully update a post and return 200', async () => {
      const response = await apiUtil.makeRequest({
        method: 'PUT',
        url: `${POSTS_BASE_URL}/${testData.existingPostId}`,
        data: testData.updatePost,
        logMessage: `PUT update post ${testData.existingPostId}`,
        responseType: 'full'
      });

      await commonUtil.compareTwoValues(response.status, 200, 'Response status');
      await commonUtil.compareTwoValues(response.data?.id, testData.existingPostId, 'Updated post id');
      await commonUtil.compareTwoValues(response.data?.title, testData.updatePost.title, 'Updated post title');
      await commonUtil.compareTwoValues(response.data?.body, testData.updatePost.body, 'Updated post body');
      await commonUtil.compareTwoValues(response.data?.userId, testData.updatePost.userId, 'Updated post userId');
    });

    it('Testcase 2. PATCH /posts/:id - should partially update a post and return 200', async () => {
      const response = await apiUtil.makeRequest({
        method: 'PATCH',
        url: `${POSTS_BASE_URL}/${testData.existingPostId}`,
        data: testData.patchPost,
        logMessage: `PATCH update post ${testData.existingPostId}`,
        responseType: 'full'
      });

      await commonUtil.compareTwoValues(response.status, 200, 'Response status');
      await commonUtil.compareTwoValues(response.data?.id, testData.existingPostId, 'Patched post id');
      await commonUtil.compareTwoValues(response.data?.title, testData.patchPost.title, 'Patched post title');

      const bodyDefined = response.data?.body !== undefined && response.data?.body !== null;
      await commonUtil.compareTwoValues(bodyDefined, true, 'Patched post body is defined');

      const userIdDefined = response.data?.userId !== undefined && response.data?.userId !== null;
      await commonUtil.compareTwoValues(userIdDefined, true, 'Patched post userId is defined');
    });
  });

  describe('4. DELETE operation', () => {
    it('Testcase 1. DELETE /posts/:id - should delete a post and return 200', async () => {
      const response = await apiUtil.makeRequest({
        method: 'DELETE',
        url: `${POSTS_BASE_URL}/${testData.existingPostId}`,
        logMessage: `Delete post ${testData.existingPostId}`,
        responseType: 'full'
      });

      await commonUtil.compareTwoValues(response.status, 200, 'Delete response status');
    });
  });

  describe('5. CRUD flow (Create -> Read -> Update -> Delete)', () => {
    it('Testcase 1. should complete full CRUD lifecycle', async () => {
      const createResponse = await apiUtil.makeRequest({
        method: 'POST',
        url: POSTS_BASE_URL,
        data: testData.crudFlowPost,
        logMessage: 'Create post in CRUD flow',
        responseType: 'full'
      });

      await commonUtil.compareTwoValues(createResponse.status, 201, 'CREATE response status');
      const createdId = createResponse.data.id;
      await commonUtil.compareTwoValues(createdId != null, true, `CREATE returned id (id: ${createdId})`);
      await commonUtil.compareTwoValues(createResponse.data?.title, testData.crudFlowPost.title, 'CREATE response title');

      const getResponse = await apiUtil.makeRequest({
        method: 'GET',
        url: `${POSTS_BASE_URL}/${testData.existingPostId}`,
        logMessage: 'Read existing post in CRUD flow',
        responseType: 'full'
      });

      await commonUtil.compareTwoValues(getResponse.status, 200, 'READ response status');
      await commonUtil.compareTwoValues(getResponse.data?.id, testData.existingPostId, 'READ post id');

      const patchResponse = await apiUtil.makeRequest({
        method: 'PATCH',
        url: `${POSTS_BASE_URL}/${testData.existingPostId}`,
        data: { title: testData.crudFlowUpdatedTitle },
        logMessage: 'Patch post in CRUD flow',
        responseType: 'full'
      });

      await commonUtil.compareTwoValues(patchResponse.status, 200, 'PATCH response status');
      await commonUtil.compareTwoValues(patchResponse.data?.title, testData.crudFlowUpdatedTitle, 'PATCH title updated');

      const deleteResponse = await apiUtil.makeRequest({
        method: 'DELETE',
        url: `${POSTS_BASE_URL}/${testData.existingPostId}`,
        logMessage: 'Delete post in CRUD flow',
        responseType: 'full'
      });

      await commonUtil.compareTwoValues(deleteResponse.status, 200, 'DELETE response status');
    });
  });
});
