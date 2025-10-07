import { Request } from 'express';
import { Role } from '@prisma/client';

/**
 * Payload del JWT token - versión MVP simplificada
 */
export interface JwtPayload {
  sub: string; // user id (UUID)
  email: string;
  roles: Role[]; // Array de roles
  iat?: number;
  exp?: number;
}

/**
 * Request extendido con información del usuario autenticado
 */
export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

/**
 * Respuesta del endpoint de autenticación - MVP sin refresh token
 */
export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    roles: Role[];
  };
}
