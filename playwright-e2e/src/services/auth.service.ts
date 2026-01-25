import { apiClient } from '@core/api/api.client';

interface LoginResponse {
  token: string;
}

export class AuthService {
  async login(email: string, password: string): Promise<string> {
    const response = await apiClient.post<LoginResponse>('/api/login', {
      email,
      password
    });

    return response.data.token;
  }
}
