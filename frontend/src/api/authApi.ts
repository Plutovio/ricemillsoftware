import apiClient from './client';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
}

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<AuthResponse>('/auth/login/', data),

  register: (data: RegisterRequest) =>
    apiClient.post<AuthResponse>('/auth/register/', data),

  logout: () =>
    apiClient.post('/auth/logout/'),

  getUser: () =>
    apiClient.get<AuthResponse['user']>('/auth/user/'),
};
