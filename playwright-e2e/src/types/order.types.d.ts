/**
 * Order-related type definitions derived directly from Zod schemas.
 * Single source of truth is src/api/schemas/order.schema.ts
 */
import type {
  Order as SchemaOrder,
  OrdersList as SchemaOrdersList,
  CheckoutResponse as SchemaCheckoutResponse
} from '../api/schemas/order.schema';

export type Order = SchemaOrder;
export type OrdersList = SchemaOrdersList;
export type CheckoutResponse = SchemaCheckoutResponse;
