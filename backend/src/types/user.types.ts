import { Role } from '@prisma/client';

// Usuario principal (sin datos sensibles)
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  roles: Role[];
  createdAt: Date;
}

//  Usuario con estadísticas
export interface UserWithStats {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  roles: Role[];
  createdAt: Date;

  collectionsCount: number;
  contributionsCount: number;
  totalContributed: number;
  collectionsOwned: number;
}

//  Perfil público de usuario
export interface PublicUserProfile {
  id: string;
  name?: string;
  avatar?: string;
  // Sin email ni roles por privacidad
  collectionsCount: number;
  totalContributions: number;
}

// Usuario básico para relaciones
export interface BasicUser {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

// Tokens de autenticación
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Respuesta de autenticación
export interface AuthResponse {
  user: User; // User ya filtrado y seguro
  tokens: AuthTokens; // Tokens agrupados
}

// Respuesta de perfil de usuario
export interface UserProfileResponse {
  user: UserWithStats;
  recentCollections: Array<{
    id: string;
    title: string;
    currentAmount: number;
    goalAmount: number;
    status: string;
  }>;
}
