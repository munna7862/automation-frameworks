import type { APIRequestContext } from '@playwright/test';
import type { RequestOpts } from './base.client';
import { AuthClient } from './auth.client';
import { BooksClient } from './books.client';
import { CartClient } from './cart.client';
import { CheckoutClient } from './checkout.client';
import { OrdersClient } from './orders.client';
import { ProfileClient } from './profile.client';
import { InventoryClient } from './inventory.client';
import { SystemClient } from './system.client';
import { TestControlClient } from './test-control.client';

export * from './base.client';
export * from './auth.client';
export * from './books.client';
export * from './cart.client';
export * from './checkout.client';
export * from './orders.client';
export * from './profile.client';
export * from './inventory.client';
export * from './system.client';
export * from './test-control.client';

export interface ApiClientHub {
  auth: AuthClient;
  books: BooksClient;
  cart: CartClient;
  checkout: CheckoutClient;
  orders: OrdersClient;
  profile: ProfileClient;
  inventory: InventoryClient;
  system: SystemClient;
  testControl: TestControlClient;
}

export function createApiClient(
  request: APIRequestContext,
  defaultOpts?: Partial<RequestOpts>
): ApiClientHub {
  return {
    auth: new AuthClient(request, defaultOpts),
    books: new BooksClient(request, defaultOpts),
    cart: new CartClient(request, defaultOpts),
    checkout: new CheckoutClient(request, defaultOpts),
    orders: new OrdersClient(request, defaultOpts),
    profile: new ProfileClient(request, defaultOpts),
    inventory: new InventoryClient(request, defaultOpts),
    system: new SystemClient(request, defaultOpts),
    testControl: new TestControlClient(request, defaultOpts)
  };
}
