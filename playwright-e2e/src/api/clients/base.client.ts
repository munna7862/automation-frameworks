import type { APIRequestContext, APIResponse } from '@playwright/test';
import { redactBody, redactHeaders, logger } from '@automationframeworks/playwright-utils';

export interface ApiResponse<T = any> {
  status: number;
  headers: Record<string, string>;
  body: T;
  data: T;
  durationMs: number;
  raw: APIResponse;
}

export interface RequestOpts {
  token?: string;
  headers?: Record<string, string>;
  enforceCsrf?: boolean;
  omitBypassHeaders?: boolean;
  expectStatus?: number | number[];
  params?: Record<string, string | number | boolean>;
  data?: any;
  timeout?: number;
  multipart?: { [key: string]: any };
}

export abstract class BaseClient {
  constructor(
    protected readonly request: APIRequestContext,
    protected readonly defaultOpts: Partial<RequestOpts> = {}
  ) {}

  protected async execute<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    url: string,
    opts: RequestOpts = {}
  ): Promise<ApiResponse<T>> {
    const omitBypass = opts.omitBypassHeaders ?? this.defaultOpts.omitBypassHeaders ?? false;
    const mergedHeaders: Record<string, string> = {
      Accept: 'application/json',
      ...(!omitBypass ? { 'x-bypass-rate-limit': 'true' } : {}),
      ...(opts.enforceCsrf
        ? { 'x-enforce-csrf': 'true' }
        : !omitBypass
          ? { 'x-bypass-csrf': 'true' }
          : {}),
      ...this.defaultOpts.headers,
      ...opts.headers
    };

    const token = opts.token || this.defaultOpts.token;
    if (token) {
      mergedHeaders['Authorization'] = `Bearer ${token}`;
    }

    if (opts.multipart) {
      delete mergedHeaders['Content-Type'];
      delete mergedHeaders['content-type'];
    } else if (
      opts.data !== undefined &&
      !mergedHeaders['Content-Type'] &&
      !mergedHeaders['content-type']
    ) {
      mergedHeaders['Content-Type'] = 'application/json';
    }

    const fetchOptions: Parameters<APIRequestContext['fetch']>[1] = {
      method,
      headers: mergedHeaders,
      params: opts.params,
      data: opts.data,
      multipart: opts.multipart,
      timeout: opts.timeout
    };

    // Sensitive data redaction for client-level debug logs
    if (process.env.DEBUG_API_CLIENT === 'true') {
      logger.debug(
        `[BaseClient] ${method} ${url} | Headers: ${JSON.stringify(redactHeaders(mergedHeaders))} | Data: ${JSON.stringify(redactBody(opts.data))}`
      );
    }

    const startTime = Date.now();
    const raw = await this.request.fetch(url, fetchOptions);
    const durationMs = Date.now() - startTime;

    const rawText = await raw.text();
    let body: any;
    try {
      body = JSON.parse(rawText);
    } catch {
      body = rawText;
    }

    if (process.env.DEBUG_API_CLIENT === 'true') {
      logger.debug(
        `[BaseClient] Response ${raw.status()} (${durationMs}ms) | Body: ${JSON.stringify(redactBody(body))}`
      );
    }

    return {
      status: raw.status(),
      headers: raw.headers(),
      body,
      data: body,
      durationMs,
      raw
    };
  }

  public async httpGet<T>(url: string, opts?: RequestOpts): Promise<ApiResponse<T>> {
    return this.execute<T>('GET', url, opts);
  }

  public async httpPost<T>(url: string, data?: any, opts?: RequestOpts): Promise<ApiResponse<T>> {
    return this.execute<T>('POST', url, { ...opts, data });
  }

  public async httpPut<T>(url: string, data?: any, opts?: RequestOpts): Promise<ApiResponse<T>> {
    return this.execute<T>('PUT', url, { ...opts, data });
  }

  public async httpPatch<T>(url: string, data?: any, opts?: RequestOpts): Promise<ApiResponse<T>> {
    return this.execute<T>('PATCH', url, { ...opts, data });
  }

  public async httpDelete<T>(url: string, opts?: RequestOpts): Promise<ApiResponse<T>> {
    return this.execute<T>('DELETE', url, opts);
  }
}
