import { WithdrawalStatus } from '@prisma/client';
import { BasicUser } from './user.types';

export interface WithdrawalWithUser {
  id: string;
  amount: number;
  currency: 'PEN';
  reason?: string;
  status: WithdrawalStatus;
  requestedAt: Date;
  processedAt?: Date;

  requestedBy: BasicUser;

  collection: {
    id: string;
    title: string;
    currentAmount: number;
  };
}

export interface BasicWithdrawal {
  id: string;
  amount: number;
  currency: 'PEN';
  reason?: string;
  status: WithdrawalStatus;
  requestedAt: Date;
  processedAt?: Date;
}

export interface WithdrawalStats {
  totalRequested: number;
  totalApproved: number;
  totalRejected: number;
  totalPending: number;
  totalAmount: number;
}

export interface CollectionWithdrawalsResponse {
  withdrawals: WithdrawalWithUser[];
  stats: WithdrawalStats;
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
}
