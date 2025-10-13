import { httpClient } from '../client';
import { API_ENDPOINTS } from '@/constants';
import type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  User,
} from '@/types';

export const authApi = {

  login: (credentials: LoginCredentials): Promise<AuthResponse> => {
    return httpClient.post<AuthResponse, LoginCredentials>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials,
      { requiresAuth: false }
    );
  },

  register: (data: RegisterData): Promise<AuthResponse> => {
    return httpClient.post<AuthResponse, RegisterData>(
      API_ENDPOINTS.AUTH.REGISTER,
      data,
      { requiresAuth: false }
    );
  },

  logout: (): Promise<void> => {
    return httpClient.post<void>(API_ENDPOINTS.AUTH.LOGOUT);
  },

  refreshToken: (refreshToken: string): Promise<AuthResponse> => {
    return httpClient.post<AuthResponse, { refreshToken: string }>(
      API_ENDPOINTS.AUTH.REFRESH,
      { refreshToken },
      { requiresAuth: false }
    );
  },

  me: (): Promise<User> => {
    return httpClient.get<User>(API_ENDPOINTS.AUTH.ME);
  },
};
