import { BaseClient, type ApiResponse, type RequestOpts } from './base.client';
import type { InventoryReport } from '../schemas/inventory.schema';

export class InventoryClient extends BaseClient {
  public async report(opts?: RequestOpts): Promise<ApiResponse<InventoryReport>> {
    return this.httpGet<InventoryReport>('/api/inventory/report', opts);
  }
}
