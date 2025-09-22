import { Request } from 'express';

export interface JwtPayload {
  sub: number;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: number;
    email: string;
    name: string | null;
    role: string;
  };
}
