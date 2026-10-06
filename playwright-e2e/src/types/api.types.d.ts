/**
 * API-related type definitions derived directly from Zod schemas.
 * Single source of truth is src/api/schemas/error.schema.ts
 */
import type {
  ApiErrorResponse as SchemaApiErrorResponse,
  ApiErrorDetail as SchemaApiErrorDetail
} from '../api/schemas/error.schema';

export type ApiErrorResponse = SchemaApiErrorResponse;
export type ApiErrorDetail = SchemaApiErrorDetail;

/** Real-time bookstore event emitted over WebSocket. */
export interface BookstoreEvent {
  id: string;
  message: string;
  type: 'purchase' | 'sale' | 'views' | 'stock';
  timestamp: string;
}
