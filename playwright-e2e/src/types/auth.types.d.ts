/**
 * Authentication-related type definitions derived directly from Zod schemas.
 * Single source of truth is src/api/schemas/auth.schema.ts and src/api/schemas/profile.schema.ts
 */
import type {
  UserRecord as SchemaUserRecord,
  AuthUser as SchemaAuthUser,
  AuthTokensResponse as SchemaAuthTokensResponse,
  LogoutResponse as SchemaLogoutResponse
} from '../api/schemas/auth.schema';
import type { UserProfile as SchemaUserProfile } from '../api/schemas/profile.schema';

export type UserRecord = SchemaUserRecord;
export type AuthUser = SchemaAuthUser;
export type AuthTokensResponse = SchemaAuthTokensResponse;
export type LogoutResponse = SchemaLogoutResponse;
export type UserProfile = SchemaUserProfile;
