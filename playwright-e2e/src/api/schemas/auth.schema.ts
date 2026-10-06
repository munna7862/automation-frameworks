import { z } from 'zod';

/**
 * Authentication & Authorization Schemas.
 * Policy: STRICT to prevent accidental credential or sensitive field leakage (e.g. passwordHash).
 */
export const AuthTokensResponseSchema = z
  .object({
    message: z.string().optional(),
    success: z.boolean().optional(),
    username: z.string(),
    token: z.string(),
    refreshToken: z.string()
  })
  .strict();

export const UserRecordSchema = z
  .object({
    passwordHash: z.string(),
    fullName: z.string().optional(),
    avatarUrl: z.string().nullable().optional()
  })
  .strict();

export const AuthUserSchema = z
  .object({
    username: z.string(),
    type: z.string().optional(),
    fullName: z.string().optional()
  })
  .strict();

export const LogoutResponseSchema = z
  .object({
    message: z.string(),
    success: z.boolean().optional()
  })
  .strict();

export type AuthTokensResponse = z.infer<typeof AuthTokensResponseSchema>;
export type UserRecord = z.infer<typeof UserRecordSchema>;
export type AuthUser = z.infer<typeof AuthUserSchema>;
export type LogoutResponse = z.infer<typeof LogoutResponseSchema>;
