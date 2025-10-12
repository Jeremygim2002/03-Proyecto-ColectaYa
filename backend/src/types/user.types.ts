// ======================================================
// USER TYPES - BACKEND
// ======================================================

import { Role } from '@prisma/client';

/**
 * Usuario principal (sin datos sensibles)
 * 🎯 DEBE coincidir exactamente con frontend
 * 🔒 SEGURO: NO incluye password, refreshTokens, bankData
 */
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  roles: Role[];
  createdAt: Date;
  // ❌ NUNCA incluir: password, refreshTokens, bankAccount, internalNotes
}

/**
 * Usuario con estadísticas
 * 🎯 DEBE coincidir exactamente con frontend
 */
export interface UserWithStats {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  roles: Role[];
  createdAt: Date;
  // Estadísticas
  collectionsCount: number;
  contributionsCount: number;
  totalContributed: number;
  collectionsOwned: number;
}

/**
 * Perfil público de usuario
 * 🎯 DEBE coincidir exactamente con frontend
 */
export interface PublicUserProfile {
  id: string;
  name?: string;
  avatar?: string;
  // Sin email ni roles por privacidad
  collectionsCount: number;
  totalContributions: number;
}

/**
 * Usuario básico para relaciones
 * 🎯 DEBE coincidir exactamente con frontend
 */
export interface BasicUser {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

/**
 * Respuesta de autenticación
 * 🎯 DEBE coincidir exactamente con frontend
 * 🔒 SEGURO: refreshToken solo en respuesta, nunca en User
 */
export interface AuthResponse {
  user: User; // User ya filtrado y seguro
  accessToken: string;
  refreshToken?: string; // Solo aquí, nunca en User interface
  expiresIn: number;
}

/**
 * Respuesta de perfil de usuario
 * 🎯 DEBE coincidir exactamente con frontend
 */
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
