import { z } from 'zod';
import { BookSchema } from './book.schema';

/**
 * Order & Checkout Schemas.
 * Policy: Passthrough to support additional transaction metadata.
 */
export const OrderSchema = z
  .object({
    id: z.string(),
    items: z.array(BookSchema),
    total: z.number(),
    customerName: z.string(),
    date: z.string()
  })
  .passthrough();

export const OrdersListSchema = z.array(OrderSchema);

export const CheckoutResponseSchema = z
  .object({
    success: z.boolean(),
    message: z.string(),
    orderId: z.string().optional()
  })
  .passthrough();

export type Order = z.infer<typeof OrderSchema>;
export type OrdersList = z.infer<typeof OrdersListSchema>;
export type CheckoutResponse = z.infer<typeof CheckoutResponseSchema>;
