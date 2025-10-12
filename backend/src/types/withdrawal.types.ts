// ======================================================
// WITHDRAWAL TYPES - BACKEND
// ======================================================

import { WithdrawalStatus } from '@prisma/client';
import { BasicUser } from './user.types';

/**
 * Retiro con información del usuario
 * 🎯 DEBE coincidir exactamente con frontend
 */
export interface WithdrawalWithUser {
  id: string;
  amount: number;
  currency: 'PEN'; // 🏦 Siempre soles peruanos
  reason?: string;
  status: WithdrawalStatus;
  requestedAt: Date;
  processedAt?: Date;

  // Usuario que solicitó el retiro
  requestedBy: BasicUser;

  // Información de la colecta
  collection: {
    id: string;
    title: string;
    currentAmount: number;
  };
}

/**
 * Retiro básico para listas
 * 🎯 DEBE coincidir exactamente con frontend
 */
export interface BasicWithdrawal {
  id: string;
  amount: number;
  currency: 'PEN'; // 🏦 Siempre soles peruanos
  reason?: string;
  status: WithdrawalStatus;
  requestedAt: Date;
  processedAt?: Date;
}

/**
 * Estadísticas de retiros
 * 🎯 DEBE coincidir exactamente con frontend
 */
export interface WithdrawalStats {
  totalRequested: number;
  totalApproved: number;
  totalRejected: number;
  totalPending: number;
  totalAmount: number;
}

/**
 * Respuesta de retiros de colecta
 * 🎯 DEBE coincidir exactamente con frontend
 */
export interface CollectionWithdrawalsResponse {
  withdrawals: WithdrawalWithUser[];
  stats: WithdrawalStats;
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
}
