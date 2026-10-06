import { BaseClient, type ApiResponse, type RequestOpts } from './base.client';
import type { AuthTokensResponse, LogoutResponse } from '../schemas/auth.schema';
import type { UserProfile } from '../schemas/profile.schema';

export interface RegisterPayload {
  username?: string;
  password?: string;
  fullName?: string;
}

export interface LoginPayload {
  username?: string;
  password?: string;
}

export class AuthClient extends BaseClient {
  public async register(
    payload: RegisterPayload,
    opts?: RequestOpts
  ): Promise<ApiResponse<AuthTokensResponse>> {
    return this.httpPost<AuthTokensResponse>('/api/register', payload, opts);
  }

  public async login(
    payload: LoginPayload,
    opts?: RequestOpts
  ): Promise<ApiResponse<AuthTokensResponse>> {
    return this.httpPost<AuthTokensResponse>('/api/login', payload, opts);
  }

  public async logout(opts?: RequestOpts): Promise<ApiResponse<LogoutResponse>> {
    return this.httpPost<LogoutResponse>('/api/logout', undefined, opts);
  }

  public async refresh(
    payload?: { refreshToken?: string },
    opts?: RequestOpts
  ): Promise<ApiResponse<AuthTokensResponse>> {
    return this.httpPost<AuthTokensResponse>('/api/auth/refresh', payload, opts);
  }

  public async me(opts?: RequestOpts): Promise<ApiResponse<UserProfile>> {
    return this.httpGet<UserProfile>('/api/profile', opts);
  }

  public async get<T>(url: string, opts?: RequestOpts): Promise<ApiResponse<T>> {
    return this.httpGet<T>(url, opts);
  }

  public async post<T>(url: string, data?: any, opts?: RequestOpts): Promise<ApiResponse<T>> {
    return this.httpPost<T>(url, data, opts);
  }
}
