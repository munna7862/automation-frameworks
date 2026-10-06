import { z } from 'zod';

/**
 * Inventory Report Schema.
 * Policy: Passthrough for reporting metrics extensions.
 */
export const InventoryReportSchema = z
  .object({
    totalBooks: z.number(),
    totalValue: z.number(),
    timestamp: z.string()
  })
  .passthrough();

export type InventoryReport = z.infer<typeof InventoryReportSchema>;
