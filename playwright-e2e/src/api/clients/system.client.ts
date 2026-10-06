import { BaseClient, type ApiResponse, type RequestOpts } from './base.client';
import type { Health, Metrics, CsrfToken } from '../schemas/health.schema';

export class SystemClient extends BaseClient {
  public async health(opts?: RequestOpts): Promise<ApiResponse<Health>> {
    return this.httpGet<Health>('/api/health', opts);
  }

  public async metrics(opts?: RequestOpts): Promise<ApiResponse<Metrics>> {
    return this.httpGet<Metrics>('/api/metrics', opts);
  }

  public async csrfToken(opts?: RequestOpts): Promise<ApiResponse<CsrfToken>> {
    return this.httpGet<CsrfToken>('/api/csrf-token', opts);
  }
}
