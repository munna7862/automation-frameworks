/**
 * Book-related type definitions derived directly from Zod schemas.
 * Single source of truth is src/api/schemas/book.schema.ts
 */
import type {
  Book as SchemaBook,
  CartItem as SchemaCartItem,
  PaginatedBooks as SchemaPaginatedBooks
} from '../api/schemas/book.schema';

export type Book = SchemaBook;
export type CartItem = SchemaCartItem;
export type PaginatedBooks = SchemaPaginatedBooks;
