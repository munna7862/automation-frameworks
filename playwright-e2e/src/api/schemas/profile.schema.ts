import { z } from 'zod';

/**
 * User Profile & Avatar Upload Schemas.
 * Policy: Passthrough to accommodate profile extensions (e.g. bio, preferences).
 */
export const UserProfileSchema = z
  .object({
    username: z.string(),
    fullName: z.string().nullable().optional(),
    avatarUrl: z.string().nullable().optional()
  })
  .passthrough();

export const AvatarUploadResponseSchema = z
  .object({
    success: z.boolean().optional(),
    message: z.string().optional(),
    avatarUrl: z.string()
  })
  .passthrough();

export type UserProfile = z.infer<typeof UserProfileSchema>;
export type AvatarUploadResponse = z.infer<typeof AvatarUploadResponseSchema>;
