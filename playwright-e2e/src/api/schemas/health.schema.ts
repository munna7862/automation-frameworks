import { z } from 'zod';

/**
 * System Health, Metrics & CSRF Schemas.
 * Policy: Passthrough for monitoring telemetry fields.
 */
export const MemoryUsageSchema = z
  .object({
    heapUsed: z.number(),
    heapTotal: z.number(),
    rss: z.number(),
    external: z.number().optional(),
    arrayBuffers: z.number().optional()
  })
  .passthrough();

export const HealthSchema = z
  .object({
    status: z.string(),
    uptime: z.number(),
    memory: MemoryUsageSchema.optional()
  })
  .passthrough();

export const MetricsSchema = z
  .object({
    status: z.string(),
    uptime: z.number(),
    memory: MemoryUsageSchema.optional()
  })
  .passthrough();

export const CsrfTokenSchema = z
  .object({
    csrfToken: z.string()
  })
  .passthrough();

export type MemoryUsage = z.infer<typeof MemoryUsageSchema>;
export type Health = z.infer<typeof HealthSchema>;
export type Metrics = z.infer<typeof MetricsSchema>;
export type CsrfToken = z.infer<typeof CsrfTokenSchema>;
