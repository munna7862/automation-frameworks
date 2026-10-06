import { z } from 'zod';

/**
 * Book & Catalog Zod Schemas.
 * Policy: Passthrough to accommodate additive fields across backend versions.
 */
export const BookSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    author: z.string(),
    price: z.number(),
    image: z.string(),
    genre: z.string().optional(),
    description: z.string().optional(),
    stock: z.number().optional(),
    version: z.number().optional()
  })
  .passthrough();

export const CartItemSchema = BookSchema.pick({
  id: true,
  title: true,
  price: true
}).passthrough();

export const PaginatedBooksSchema = z
  .object({
    books: z.array(BookSchema),
    total: z.number(),
    page: z.number(),
    totalPages: z.number(),
    limit: z.number()
  })
  .passthrough();

export const BookListSchema = z.union([z.array(BookSchema), PaginatedBooksSchema]);

export type Book = z.infer<typeof BookSchema>;
export type CartItem = z.infer<typeof CartItemSchema>;
export type PaginatedBooks = z.infer<typeof PaginatedBooksSchema>;
