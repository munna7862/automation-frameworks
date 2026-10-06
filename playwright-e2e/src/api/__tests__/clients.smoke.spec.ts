import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { request } from '@playwright/test';
import { envConfig } from '../../config/env.config';
import { createApiClient } from '../clients';
import {
  BookSchema,
  PaginatedBooksSchema,
  CartSchema,
  InventoryReportSchema,
  HealthSchema,
  MetricsSchema,
  CsrfTokenSchema,
  ChaosConfigSchema
} from '../schemas';

describe('API Clients Smoke & Schema Validation (Unit-Level)', async () => {
  let api: ReturnType<typeof createApiClient>;

  before(async () => {
    const context = await request.newContext({
      baseURL: envConfig.apiBaseUrl,
      extraHTTPHeaders: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'x-bypass-rate-limit': 'true',
        'x-test-session-id': `smoke-${Date.now()}`
      }
    });
    api = createApiClient(context);
    // Authenticate default seed user to test authenticated cart endpoint
    await api.auth.login({ username: 'testuser', password: 'buggybooks' });
  });

  it('GET /api/books should conform to PaginatedBooksSchema', async () => {
    const res = await api.books.list({ page: 1, limit: 2 });
    assert.equal(res.status, 200);
    const parsed = PaginatedBooksSchema.safeParse(res.body);
    assert.equal(parsed.success, true, `Schema validation failed: ${JSON.stringify(parsed)}`);
    assert.ok(res.durationMs < 5000, `Took ${res.durationMs}ms`);
  });

  it('GET /api/books/:id should conform to BookSchema', async () => {
    const res = await api.books.getById('1');
    assert.equal(res.status, 200);
    const parsed = BookSchema.safeParse(res.body);
    assert.equal(parsed.success, true, `Schema validation failed: ${JSON.stringify(parsed)}`);
  });

  it('GET /api/cart should conform to CartSchema', async () => {
    const res = await api.cart.get();
    assert.equal(res.status, 200);
    const parsed = CartSchema.safeParse(res.body);
    assert.equal(parsed.success, true, `Schema validation failed: ${JSON.stringify(parsed)}`);
  });

  it('GET /api/inventory/report should conform to InventoryReportSchema', async () => {
    const res = await api.inventory.report();
    assert.equal(res.status, 200);
    const parsed = InventoryReportSchema.safeParse(res.body);
    assert.equal(parsed.success, true, `Schema validation failed: ${JSON.stringify(parsed)}`);
  });

  it('GET /api/health should conform to HealthSchema', async () => {
    const res = await api.system.health();
    assert.equal(res.status, 200);
    const parsed = HealthSchema.safeParse(res.body);
    assert.equal(parsed.success, true, `Schema validation failed: ${JSON.stringify(parsed)}`);
  });

  it('GET /api/metrics should conform to MetricsSchema', async () => {
    const res = await api.system.metrics();
    assert.equal(res.status, 200);
    const parsed = MetricsSchema.safeParse(res.body);
    assert.equal(parsed.success, true, `Schema validation failed: ${JSON.stringify(parsed)}`);
  });

  it('GET /api/csrf-token should conform to CsrfTokenSchema', async () => {
    const res = await api.system.csrfToken();
    assert.equal(res.status, 200);
    const parsed = CsrfTokenSchema.safeParse(res.body);
    assert.equal(parsed.success, true, `Schema validation failed: ${JSON.stringify(parsed)}`);
  });

  it('GET /api/test/config should conform to ChaosConfigSchema', async () => {
    const res = await api.testControl.getConfig();
    assert.equal(res.status, 200);
    const parsed = ChaosConfigSchema.safeParse(res.body);
    assert.equal(parsed.success, true, `Schema validation failed: ${JSON.stringify(parsed)}`);
  });
});
