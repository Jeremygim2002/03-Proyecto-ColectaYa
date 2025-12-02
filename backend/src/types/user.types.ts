import { Role } from '@prisma/client';

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  roles: Role[];
  createdAt: Date;
}

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

export interface PublicUserProfile {
  id: string;
  name?: string;
  avatar?: string;
  collectionsCount: number;
  totalContributions: number;
}

export interface BasicUser {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

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
