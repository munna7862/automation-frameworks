import { BaseClient, type ApiResponse, type RequestOpts } from './base.client';
import type { Book, PaginatedBooks } from '../schemas/book.schema';

export interface BookListParams {
  page?: number | string;
  limit?: number | string;
  search?: string;
  genre?: string;
  [key: string]: any;
}

export class BooksClient extends BaseClient {
  public async list<T = PaginatedBooks | Book[]>(
    params?: BookListParams,
    opts?: RequestOpts
  ): Promise<ApiResponse<T>> {
    return this.httpGet<T>('/api/books', {
      ...opts,
      params: params as Record<string, string | number | boolean>
    });
  }

  public async getById(id: string, opts?: RequestOpts): Promise<ApiResponse<Book>> {
    return this.httpGet<Book>(`/api/books/${id}`, opts);
  }

  public async get<T>(url: string, opts?: RequestOpts): Promise<ApiResponse<T>> {
    return this.httpGet<T>(url, opts);
  }
}
