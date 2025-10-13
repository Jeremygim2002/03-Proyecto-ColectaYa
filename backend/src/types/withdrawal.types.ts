import { WithdrawalStatus } from '@prisma/client';
import { BasicUser } from './user.types';

//  Retiro con información del usuario
export interface WithdrawalWithUser {
  id: string;
  amount: number;
  currency: 'PEN';
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

// Retiro básico para listas
export interface BasicWithdrawal {
  id: string;
  amount: number;
  currency: 'PEN';
  reason?: string;
  status: WithdrawalStatus;
  requestedAt: Date;
  processedAt?: Date;
}

// Estadísticas de retiros
export interface WithdrawalStats {
  totalRequested: number;
  totalApproved: number;
  totalRejected: number;
  totalPending: number;
  totalAmount: number;
}

// Respuesta de retiros de colecta
export interface CollectionWithdrawalsResponse {
  withdrawals: WithdrawalWithUser[];
  stats: WithdrawalStats;
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
}
