/**
 * Minimal HTTP client abstraction to allow ApiSeeder to work identically across
 * Playwright APIRequestContext, Axios (Selenium / WDIO), Node fetch, and other runners.
 */

export interface HttpRequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number>;
  timeout?: number;
}

export interface HttpResponse<T = any> {
  status: number;
  ok: boolean;
  data: T;
  headers: Record<string, string>;
}

export interface HttpLike {
  get<T = any>(url: string, options?: HttpRequestOptions): Promise<HttpResponse<T>>;
  post<T = any>(url: string, data?: any, options?: HttpRequestOptions): Promise<HttpResponse<T>>;
  put<T = any>(url: string, data?: any, options?: HttpRequestOptions): Promise<HttpResponse<T>>;
  delete<T = any>(url: string, options?: HttpRequestOptions): Promise<HttpResponse<T>>;
}

/**
 * Adapter wrapping Playwright's APIRequestContext into an HttpLike interface.
 */
export function createPlaywrightAdapter(
  request: {
    get: (url: string, options?: any) => Promise<any>;
    post: (url: string, options?: any) => Promise<any>;
    put: (url: string, options?: any) => Promise<any>;
    delete: (url: string, options?: any) => Promise<any>;
  },
  baseUrl: string = ''
): HttpLike {
  const resolveUrl = (path: string): string => {
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const base = baseUrl.replace(/\/+$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return base ? `${base}${cleanPath}` : cleanPath;
  };

  const wrapResponse = async <T>(pwRes: any): Promise<HttpResponse<T>> => {
    let data: any;
    try {
      data = await pwRes.json();
    } catch {
      try {
        data = await pwRes.text();
      } catch {
        data = null;
      }
    }
    const headers: Record<string, string> = {};
    if (typeof pwRes.headers === 'function') {
      const h = pwRes.headers();
      for (const [k, v] of Object.entries(h)) {
        headers[k.toLowerCase()] = String(v);
      }
    }
    return {
      status: pwRes.status(),
      ok: pwRes.ok ? pwRes.ok() : pwRes.status() >= 200 && pwRes.status() < 300,
      data,
      headers
    };
  };

  return {
    async get<T>(url: string, options?: HttpRequestOptions) {
      const res = await request.get(resolveUrl(url), {
        headers: options?.headers,
        params: options?.params,
        timeout: options?.timeout
      });
      return wrapResponse<T>(res);
    },
    async post<T>(url: string, data?: any, options?: HttpRequestOptions) {
      const res = await request.post(resolveUrl(url), {
        data,
        headers: options?.headers,
        params: options?.params,
        timeout: options?.timeout
      });
      return wrapResponse<T>(res);
    },
    async put<T>(url: string, data?: any, options?: HttpRequestOptions) {
      const res = await request.put(resolveUrl(url), {
        data,
        headers: options?.headers,
        params: options?.params,
        timeout: options?.timeout
      });
      return wrapResponse<T>(res);
    },
    async delete<T>(url: string, options?: HttpRequestOptions) {
      const res = await request.delete(resolveUrl(url), {
        headers: options?.headers,
        params: options?.params,
        timeout: options?.timeout
      });
      return wrapResponse<T>(res);
    }
  };
}

/**
 * Adapter wrapping Axios into an HttpLike interface.
 */
export function createAxiosAdapter(
  axiosInstance: {
    request: (config: any) => Promise<any>;
  },
  baseUrl: string = ''
): HttpLike {
  const resolveUrl = (path: string): string => {
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const base = baseUrl.replace(/\/+$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return base ? `${base}${cleanPath}` : cleanPath;
  };

  const execute = async <T>(config: any): Promise<HttpResponse<T>> => {
    try {
      const res = await axiosInstance.request(config);
      const headers: Record<string, string> = {};
      if (res.headers) {
        for (const [k, v] of Object.entries(res.headers)) {
          headers[k.toLowerCase()] = String(v);
        }
      }
      return {
        status: res.status,
        ok: res.status >= 200 && res.status < 300,
        data: res.data,
        headers
      };
    } catch (err: any) {
      if (err.response) {
        return {
          status: err.response.status,
          ok: false,
          data: err.response.data,
          headers: err.response.headers || {}
        };
      }
      throw err;
    }
  };

  return {
    get: <T>(url: string, options?: HttpRequestOptions) =>
      execute<T>({
        method: 'GET',
        url: resolveUrl(url),
        headers: options?.headers,
        params: options?.params,
        timeout: options?.timeout
      }),
    post: <T>(url: string, data?: any, options?: HttpRequestOptions) =>
      execute<T>({
        method: 'POST',
        url: resolveUrl(url),
        data,
        headers: options?.headers,
        params: options?.params,
        timeout: options?.timeout
      }),
    put: <T>(url: string, data?: any, options?: HttpRequestOptions) =>
      execute<T>({
        method: 'PUT',
        url: resolveUrl(url),
        data,
        headers: options?.headers,
        params: options?.params,
        timeout: options?.timeout
      }),
    delete: <T>(url: string, options?: HttpRequestOptions) =>
      execute<T>({
        method: 'DELETE',
        url: resolveUrl(url),
        headers: options?.headers,
        params: options?.params,
        timeout: options?.timeout
      })
  };
}
