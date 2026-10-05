import axios from 'axios';
import { CommonFunctions, redactBody } from '@automationframeworks/playwright-utils';

export class ApiError extends Error {
  public readonly status?: number;
  public readonly data?: any;
  public readonly headers?: Record<string, any>;
  public readonly url?: string;
  public readonly method?: string;

  constructor(options: {
    message: string;
    status?: number;
    data?: any;
    headers?: Record<string, any>;
    url?: string;
    method?: string;
  }) {
    super(options.message);
    this.name = 'ApiError';
    this.status = options.status;
    this.data = options.data;
    this.headers = options.headers;
    this.url = options.url;
    this.method = options.method;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export class ApiUtil {
  private objCommonFunctions: CommonFunctions;
  private sessionId?: string;

  constructor(sessionId?: string) {
    this.objCommonFunctions = new CommonFunctions();
    this.sessionId = sessionId;
  }

  public setSessionId(sessionId?: string): void {
    this.sessionId = sessionId;
  }

  public getSessionId(): string | undefined {
    return this.sessionId;
  }

  /**
   * Enhanced method to make HTTP requests with structured error handling, payload redaction,
   * and fail-fast ApiError throwing by default.
   */
  public async makeRequest<T = any>(options: {
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    url: string;
    data?: any;
    headers?: Record<string, string>;
    logMessage: string;
    responseType?: 'data' | 'status' | 'headers' | 'full';
    timeout?: number;
    throwOnError?: boolean;
  }): Promise<T> {
    const {
      method,
      url,
      data,
      headers = {},
      logMessage,
      responseType = 'data',
      timeout = 30000,
      throwOnError = true
    } = options;

    try {
      await this.objCommonFunctions.logMessage('INFO', `🚀 Making ${method} request to ${url}`);
      if (data) {
        const redactedData = redactBody(data);
        await this.objCommonFunctions.logMessage(
          'INFO',
          `📤 Request Payload: ${typeof redactedData === 'string' ? redactedData : JSON.stringify(redactedData, null, 2)}`
        );
      }

      const sessionHeaders: Record<string, string> = this.sessionId
        ? { 'x-test-session-id': this.sessionId }
        : {};

      const config: any = {
        method,
        url,
        headers: {
          'Content-Type': 'application/json',
          'x-bypass-rate-limit': 'true',
          ...sessionHeaders,
          ...headers
        },
        timeout,
        ...(data && ['POST', 'PUT', 'PATCH'].includes(method) && { data })
      };

      const response = await axios(config);

      await this.objCommonFunctions.logMessage(
        'PASS',
        `✅ ${logMessage} Success! Status: ${response.status} ${response.statusText}`
      );
      if (response.headers['trace-id']) {
        await this.objCommonFunctions.logMessage(
          'INFO',
          `🔍 Trace ID: ${response.headers['trace-id']}`
        );
      }
      const redactedResponse = redactBody(response.data);
      await this.objCommonFunctions.logMessage(
        'INFO',
        `📥 Response Payload: ${typeof redactedResponse === 'string' ? redactedResponse : JSON.stringify(redactedResponse, null, 2)}`
      );

      return (responseType === 'full' ? response : response[responseType]) as T;
    } catch (error: any) {
      const redactedErrorData = error.response ? redactBody(error.response.data) : null;
      const errorDetails = error.response
        ? `Status: ${error.response.status} ${error.response.statusText} | Response: ${JSON.stringify(redactedErrorData, null, 2)}`
        : `Message: ${error.message}`;

      await this.objCommonFunctions.logMessage('FAIL', `❌ ${logMessage} Failed! ${errorDetails}`);

      if (throwOnError === false && error.response) {
        return (responseType === 'full' ? error.response : error.response[responseType]) as T;
      }

      throw new ApiError({
        message: `API request failed: ${method} ${url} (Status: ${error.response?.status || 'Network Error'})`,
        status: error.response?.status,
        data: redactedErrorData,
        headers: error.response?.headers,
        url,
        method
      });
    }
  }

  public async getBearerToken(
    authUrl: string = process.env.AUTH_URL as string,
    clientId: string = process.env.CLIENT_ID as string,
    clientSecret: string = process.env.CLIENT_SECRET as string,
    scope: string = process.env.SCOPE as string,
    realmId: string = process.env.REALM_ID as string
  ): Promise<string> {
    const url = '' + authUrl + '?realmId=' + realmId + '';
    const requestData = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      scope: scope,
      grant_type: 'client_credentials'
    });
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    const redactedDataStr = redactBody(requestData.toString());
    await this.objCommonFunctions.logMessage(
      'INFO',
      `Fetching Bearer Token from ${url} with data: ${redactedDataStr}`
    );
    const response = await this.makeRequest<{ access_token: string }>({
      method: 'POST',
      url,
      data: requestData,
      headers,
      logMessage: 'Fetching Bearer Token'
    });
    return response.access_token;
  }
}

export default new ApiUtil();
