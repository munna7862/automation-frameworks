/**
 * Chaos/testing configuration type definitions derived directly from Zod schemas.
 * Single source of truth is src/api/schemas/test-control.schema.ts
 */
import type {
  ChaosConfig as SchemaChaosConfig,
  TestConfigPostResponse as SchemaTestConfigPostResponse,
  TestResetResponse as SchemaTestResetResponse,
  TestSessionDeleteResponse as SchemaTestSessionDeleteResponse
} from '../api/schemas/test-control.schema';

export type ChaosConfig = SchemaChaosConfig;
export type TestConfigPostResponse = SchemaTestConfigPostResponse;
export type TestResetResponse = SchemaTestResetResponse;
export type TestSessionDeleteResponse = SchemaTestSessionDeleteResponse;
