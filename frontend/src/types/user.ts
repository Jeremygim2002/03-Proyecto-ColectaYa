// User domain types
export type Role = 'USER' | 'ADMIN';

export interface User {
  id: string;
  name?: string | null;
  email: string;
  avatar?: string | null;
  roles: Role[]; 
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  expiresAt?: number;  
}

// Respuesta genérica de autenticación
export interface AuthResponse {
  user: User;
  tokens: AuthTokens;  
}

// Magic Link
export interface MagicLinkRequest {
  email: string;
}

export interface MagicLinkResponse {
  message: string;
}

// OAuth
export interface OAuthResponse {
  url: string;
}
