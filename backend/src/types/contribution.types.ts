import { ContributionStatus } from '@prisma/client';
import { BasicUser } from './user.types';

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

export interface BasicContribution {
  id: string;
  amount: number;
  currency: 'PEN';
  message?: string;
  status: ContributionStatus;
  createdAt: Date;
  userId: string;
}

export interface ContributionStats {
  total: number;
  totalAmount: number;
  averageAmount: number;
  successfulContributions: number;
  failedContributions: number;
}

export interface UserContributionsResponse {
  contributions: ContributionWithUser[];
  stats: ContributionStats;
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
}
