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
    // Filtrar confirmPassword ya que el backend no lo necesita
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...registerPayload } = data;
    return httpClient.post<AuthResponse, Omit<RegisterData, 'confirmPassword'>>(
      API_ENDPOINTS.AUTH.REGISTER,
      registerPayload,
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

  // ✅ CORREGIDO: Ahora usa /users/me
  me: (): Promise<User> => {
    return httpClient.get<User>(API_ENDPOINTS.AUTH.ME);
  },
};
