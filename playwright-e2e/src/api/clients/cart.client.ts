import { BaseClient, type ApiResponse, type RequestOpts } from './base.client';
import type { Cart, CartClearResponse } from '../schemas/cart.schema';

export class CartClient extends BaseClient {
  public async get(opts?: RequestOpts): Promise<ApiResponse<Cart>> {
    return this.httpGet<Cart>('/api/cart', opts);
  }

  public async add(bookId: string, opts?: RequestOpts): Promise<ApiResponse<Cart>> {
    return this.httpPost<Cart>('/api/cart', { bookId }, opts);
  }

  public async remove(bookId: string, opts?: RequestOpts): Promise<ApiResponse<Cart>> {
    return this.httpDelete<Cart>(`/api/cart/${bookId}`, opts);
  }

  public async clear(opts?: RequestOpts): Promise<ApiResponse<CartClearResponse>> {
    return this.httpDelete<CartClearResponse>('/api/cart', opts);
  }
}
