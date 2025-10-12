// Contribution domain types
export interface Contribution {
  id: string;
  collectionId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  amount: number;
  message?: string;
  isAnonymous: boolean;
  createdAt: string;
}

export interface CreateContributionData {
  collectionId: string;
  amount: number;
  message?: string;
  isAnonymous: boolean;
  paymentMethod: PaymentMethod;
}

export type PaymentMethod = 
  | 'credit_card' 
  | 'debit_card' 
  | 'paypal';

export interface ContributionStats {
  total: number;
  count: number;
  average: number;
  lastContribution?: Contribution;
}
