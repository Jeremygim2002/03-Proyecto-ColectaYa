// Withdrawal domain types
export interface Withdrawal {
  id: string;
  collectionId: string;
  requestedBy: string;
  requester?: {
    id: string;
    email: string;
    name?: string;
  };
  amount: number;
  status: WithdrawalStatus;
  createdAt: string;
  processedAt: string | null;
}

export type WithdrawalStatus = 
  | 'REQUESTED' 
  | 'PAID' 
  | 'REJECTED';

export interface CreateWithdrawalData {
  amount: number;
}


export interface WithdrawalListResponse {
  withdrawals: Withdrawal[];
  total: number;
}

// Respuesta del retiro inteligente
export interface IntelligentWithdrawResponse {
  message: string;
  action: 'TRANSFERRED' | 'REFUNDED';
  amount: number;
}
