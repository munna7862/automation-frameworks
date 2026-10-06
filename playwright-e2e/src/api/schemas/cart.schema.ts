import { z } from 'zod';
import { BookSchema } from './book.schema';

/**
 * Cart Schemas.
 * Policy: Passthrough for clear response, cart items follow BookSchema.
 */
export const CartSchema = z.array(BookSchema);

export const CartClearResponseSchema = z
  .object({
    success: z.boolean()
  })
  .passthrough();

export type Cart = z.infer<typeof CartSchema>;
export type CartClearResponse = z.infer<typeof CartClearResponseSchema>;
