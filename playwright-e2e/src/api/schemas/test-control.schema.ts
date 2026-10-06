import { z } from 'zod';

/**
 * Chaos & Test Control Schemas.
 * Policy: Passthrough for experimental chaos engineering knobs.
 */
export const ChaosConfigSchema = z
  .object({
    checkoutFailureRate: z.number().optional(),
    inventoryDelayMs: z.number().optional(),
    jwtExpirySeconds: z.number().optional(),
    websocketDropRate: z.number().optional(),
    uploadFailureRate: z.number().optional(),
    injectA11yViolations: z.boolean().optional(),
    visualChaos: z.boolean().optional(),
    inventoryLockingRate: z.number().optional()
  })
  .passthrough();

export const TestConfigPostResponseSchema = z
  .object({
    success: z.boolean().optional(),
    message: z.string().optional(),
    config: ChaosConfigSchema
  })
  .passthrough();

export const TestResetResponseSchema = z
  .object({
    success: z.boolean(),
    message: z.string()
  })
  .passthrough();

export const TestSessionDeleteResponseSchema = z
  .object({
    success: z.boolean(),
    message: z.string(),
    deleted: z.boolean().optional(),
    activeSessions: z.number().optional()
  })
  .passthrough();

export type ChaosConfig = z.infer<typeof ChaosConfigSchema>;
export type TestConfigPostResponse = z.infer<typeof TestConfigPostResponseSchema>;
export type TestResetResponse = z.infer<typeof TestResetResponseSchema>;
export type TestSessionDeleteResponse = z.infer<typeof TestSessionDeleteResponseSchema>;
