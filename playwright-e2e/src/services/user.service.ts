import { AxiosResponse } from 'axios';
import { apiClient } from '@core/api/api.client';
import {
  GetUserResponse,
  CreateUserResponse
} from '../models/user/user.models';

export class UserService {
  getUser(id: number): Promise<AxiosResponse<GetUserResponse>> {
    return apiClient.get<GetUserResponse>(`/api/users/${id}`);
  }

  createUser(
    payload: { name: string; job: string }
  ): Promise<AxiosResponse<CreateUserResponse>> {
    return apiClient.post<CreateUserResponse>('/api/users', payload);
  }
}
