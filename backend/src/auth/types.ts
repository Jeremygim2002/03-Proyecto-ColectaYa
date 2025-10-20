import { Request } from 'express';
import { Role } from '@prisma/client';

// TIPOS PARA SUPABASE AUTH
export interface SupabaseAuthUser {
  id: string;
  email: string;
  name?: string | null;
  avatar?: string | null;
  roles?: Role[];
  aud?: string;
  role?: string;
}

export interface AuthenticatedRequest extends Request {
  user: SupabaseAuthUser;
}

// RESPUESTAS DE AUTENTICACIÓN
export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name?: string;
    avatar?: string;
    emailVerified: boolean;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    expiresAt?: number;
  };
}
