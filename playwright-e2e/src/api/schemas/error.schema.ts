import { z } from 'zod';

/**
 * Standard Error Envelope Schema.
 * Policy: STRICT to catch unintended backend internal or sensitive data leakage.
 */
export const ApiErrorDetailSchema = z
  .object({
    expected: z.string().optional(),
    code: z.string().optional(),
    path: z.array(z.union([z.string(), z.number()])).optional(),
    message: z.string().optional()
  })
  .strict();

export const ApiErrorResponseSchema = z
  .object({
    error: z.string(),
    message: z.string().optional(),
    correlationId: z.string().optional(),
    errorName: z.string().optional(),
    details: z.union([z.string(), z.array(ApiErrorDetailSchema), z.record(z.unknown())]).optional()
  })
  .strict();

export type ApiErrorDetail = z.infer<typeof ApiErrorDetailSchema>;
export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;
