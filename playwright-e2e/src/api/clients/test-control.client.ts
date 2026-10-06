import { BaseClient, type ApiResponse, type RequestOpts } from './base.client';
import type {
  ChaosConfig,
  TestConfigPostResponse,
  TestResetResponse,
  TestSessionDeleteResponse
} from '../schemas/test-control.schema';

export class TestControlClient extends BaseClient {
  public async getConfig(opts?: RequestOpts): Promise<ApiResponse<ChaosConfig>> {
    return this.httpGet<ChaosConfig>('/api/test/config', opts);
  }

  public async setConfig<T = TestConfigPostResponse>(
    config: Partial<ChaosConfig> | Record<string, any>,
    opts?: RequestOpts
  ): Promise<ApiResponse<T>> {
    return this.httpPost<T>('/api/test/config', config, opts);
  }

  public async reset(opts?: RequestOpts): Promise<ApiResponse<TestResetResponse>> {
    return this.httpPost<TestResetResponse>('/api/test/reset', undefined, opts);
  }

  public async setStock(
    payload: { bookId: string; stock: number },
    opts?: RequestOpts
  ): Promise<ApiResponse<any>> {
    return this.httpPost('/api/test/stock', payload, opts);
  }

  public async deleteSession(
    sessionId: string,
    opts?: RequestOpts
  ): Promise<ApiResponse<TestSessionDeleteResponse>> {
    return this.httpDelete<TestSessionDeleteResponse>(`/api/test/session/${sessionId}`, opts);
  }
}
