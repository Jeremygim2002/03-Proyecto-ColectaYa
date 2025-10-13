import { Request } from 'express';
import { Role } from '@prisma/client';

export interface JwtPayload {
  sub: string; // user id (UUID)
  email: string;
  roles: Role[]; // Array de roles
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

// AuthResponse se importa desde ../types/user.types.ts para mantener consistencia
