import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { envConfig } from '@config/env.config';
import { logger } from '@core/logger/logger';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: envConfig.apiBaseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.initializeInterceptors();
  }

  private initializeInterceptors() {
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        logger.info(`API REQUEST → ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      error => {
        logger.error(`API REQUEST ERROR → ${error.message}`);
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        logger.info(
          `API RESPONSE ← ${response.status} ${response.config.url}`
        );
        return response;
      },
      error => {
        logger.error(
          `API RESPONSE ERROR ← ${error.response?.status} ${error.message}`
        );
        return Promise.reject(error);
      }
    );
  }

  get<T>(url: string, config?: InternalAxiosRequestConfig) {
    return this.client.get<T>(url, config);
  }

  post<T>(url: string, data?: unknown, config?: InternalAxiosRequestConfig) {
    return this.client.post<T>(url, data, config);
  }

  put<T>(url: string, data?: unknown, config?: InternalAxiosRequestConfig) {
    return this.client.put<T>(url, data, config);
  }

  delete<T>(url: string, config?: InternalAxiosRequestConfig) {
    return this.client.delete<T>(url, config);
  }
}

export const apiClient = new ApiClient();
