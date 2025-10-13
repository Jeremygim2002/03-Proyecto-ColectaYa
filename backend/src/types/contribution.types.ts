import { ContributionStatus } from '@prisma/client';
import { BasicUser } from './user.types';

// Contribución con información del usuario
export interface ContributionWithUser {
  id: string;
  amount: number;
  currency: 'PEN';
  message?: string;
  status: ContributionStatus;
  createdAt: Date;

  user: BasicUser;

  collection: {
    id: string;
    title: string;
  };
}

//  Contribución básica para listas
export interface BasicContribution {
  id: string;
  amount: number;
  currency: 'PEN';
  message?: string;
  status: ContributionStatus;
  createdAt: Date;
  userId: string;
}

//  Estadísticas de contribuciones
export interface ContributionStats {
  total: number;
  totalAmount: number;
  averageAmount: number;
  successfulContributions: number;
  failedContributions: number;
}

// Respuesta de contribuciones del usuario
export interface UserContributionsResponse {
  contributions: ContributionWithUser[];
  stats: ContributionStats;
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
}
