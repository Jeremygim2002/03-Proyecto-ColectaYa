// ======================================================
// CONTRIBUTION TYPES - BACKEND
// ======================================================

import { ContributionStatus } from '@prisma/client';
import { BasicUser } from './user.types';

/**
 * Contribución con información del usuario
 * 🎯 DEBE coincidir exactamente con frontend
 */
export interface ContributionWithUser {
  id: string;
  amount: number;
  currency: 'PEN'; // 🏦 Siempre soles peruanos
  message?: string;
  status: ContributionStatus;
  createdAt: Date;

  // Usuario que hizo la contribución
  user: BasicUser;

  // Información de la colecta
  collection: {
    id: string;
    title: string;
  };
}

/**
 * Contribución básica para listas
 * 🎯 DEBE coincidir exactamente con frontend
 */
export interface BasicContribution {
  id: string;
  amount: number;
  currency: 'PEN'; // 🏦 Siempre soles peruanos
  message?: string;
  status: ContributionStatus;
  createdAt: Date;
  userId: string;
}

/**
 * Estadísticas de contribuciones
 * 🎯 DEBE coincidir exactamente con frontend
 */
export interface ContributionStats {
  total: number;
  totalAmount: number;
  averageAmount: number;
  successfulContributions: number;
  failedContributions: number;
}

/**
 * Respuesta de contribuciones del usuario
 * 🎯 DEBE coincidir exactamente con frontend
 */
export interface UserContributionsResponse {
  contributions: ContributionWithUser[];
  stats: ContributionStats;
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
}
