import { BaseClient, type ApiResponse, type RequestOpts } from './base.client';
import type { OrdersList } from '../schemas/order.schema';

export class OrdersClient extends BaseClient {
  public async list(opts?: RequestOpts): Promise<ApiResponse<OrdersList>> {
    return this.httpGet<OrdersList>('/api/orders', opts);
  }
}
