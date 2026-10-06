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
    payloadOrId: { bookId: string; stock: number } | string,
    stockOrOpts?: number | RequestOpts,
    opts?: RequestOpts
  ): Promise<ApiResponse<any>> {
    let bookId: string;
    let stock: number;
    let requestOpts: RequestOpts | undefined;

    if (typeof payloadOrId === 'string') {
      bookId = payloadOrId;
      stock = typeof stockOrOpts === 'number' ? stockOrOpts : 0;
      requestOpts = opts;
    } else {
      bookId = payloadOrId.bookId;
      stock = payloadOrId.stock;
      requestOpts = stockOrOpts as RequestOpts | undefined;
    }

    return this.httpPost(`/api/test/books/${bookId}/stock`, { stock }, requestOpts);
  }

  public async deleteSession(
    sessionId: string,
    opts?: RequestOpts
  ): Promise<ApiResponse<TestSessionDeleteResponse>> {
    return this.httpDelete<TestSessionDeleteResponse>(`/api/test/session/${sessionId}`, opts);
  }
}
