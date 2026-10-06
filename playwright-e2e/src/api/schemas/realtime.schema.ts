import { z } from 'zod';

/**
 * Socket.IO Real-Time Event Schema for 'bookstore-event'.
 */
export const BookstoreEventSchema = z
  .object({
    id: z.string(),
    type: z.enum(['purchase', 'sale', 'views', 'stock']),
    message: z.string(),
    timestamp: z.string()
  })
  .passthrough();

export type BookstoreEvent = z.infer<typeof BookstoreEventSchema>;
