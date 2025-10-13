// User domain types
export type Role = 'USER' | 'ADMIN';

export interface User {
  id: string;
  name?: string;
  email: string;
  avatar?: string;
  roles: Role[]; 
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;  
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;  
}
