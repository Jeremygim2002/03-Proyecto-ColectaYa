import { httpClient } from '../client';
import { API_ENDPOINTS } from '@/constants';
import type {
  AuthResponse,
  User,
  MagicLinkResponse,
  OAuthResponse,
} from '@/types';

export const authApi = {
  logout: (): Promise<{ message: string }> => {
    return httpClient.post<{ message: string }>(API_ENDPOINTS.AUTH.LOGOUT);
  },

  refreshToken: (refreshToken: string): Promise<{ accessToken: string; refreshToken: string; expiresIn: number; expiresAt: number }> => {
    return httpClient.post<{ accessToken: string; refreshToken: string; expiresIn: number; expiresAt: number }, { refreshToken: string }>(
      API_ENDPOINTS.AUTH.REFRESH,
      { refreshToken },
      { requiresAuth: false }
    );
  },

  me: (): Promise<User> => {
    return httpClient.get<User>(API_ENDPOINTS.AUTH.ME);
  },

  // Magic Link
  magicLink: (email: string): Promise<MagicLinkResponse> => {
    return httpClient.post<MagicLinkResponse, { email: string }>(
      API_ENDPOINTS.AUTH.MAGIC_LINK,
      { email },
      { requiresAuth: false }
    );
  },

  // Google OAuth
  google: (): Promise<OAuthResponse> => {
    return httpClient.get<OAuthResponse>(API_ENDPOINTS.AUTH.GOOGLE, { requiresAuth: false });
  },

  // Facebook OAuth
  facebook: (): Promise<OAuthResponse> => {
    return httpClient.get<OAuthResponse>(API_ENDPOINTS.AUTH.FACEBOOK, { requiresAuth: false });
  },

  // OAuth Callback
  callback: (accessToken: string, refreshToken?: string): Promise<AuthResponse> => {
    return httpClient.post<AuthResponse, { access_token: string; refresh_token?: string }>(
      API_ENDPOINTS.AUTH.CALLBACK,
      { access_token: accessToken, refresh_token: refreshToken },
      { requiresAuth: false }
    );
  },
};
