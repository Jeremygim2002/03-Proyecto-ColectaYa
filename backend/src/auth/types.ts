import { Request } from 'express';
import { Role } from '@prisma/client';

/**
 * Payload del JWT token - versión unificada y tipada
 */
export interface JwtPayload {
  sub: number; // user id
  email: string;
  role: Role; // Enum de Prisma para consistencia
  iat?: number; // issued at (opcional, añadido por JWT)
  exp?: number; // expires at (opcional, añadido por JWT)
}

/**
 * Request extendido con información del usuario autenticado
 */
export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

/**
 * Respuesta del endpoint de autenticación
 */
export interface AuthResponse {
  access_token: string;
  user: {
    id: number;
    email: string;
    name: string | null;
    role: Role; // Usando enum de Prisma para consistencia
    isActive: boolean;
  };
}
