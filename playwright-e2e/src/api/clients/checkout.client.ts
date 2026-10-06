import { BaseClient, type ApiResponse, type RequestOpts } from './base.client';
import type { CheckoutResponse } from '../schemas/order.schema';

export interface CheckoutDetails {
  firstName: string;
  lastName: string;
  creditCard: string;
}

export class CheckoutClient extends BaseClient {
  public async process(
    details: CheckoutDetails,
    opts?: RequestOpts
  ): Promise<ApiResponse<CheckoutResponse>> {
    return this.httpPost<CheckoutResponse>('/api/checkout/process', details, opts);
  }
}
