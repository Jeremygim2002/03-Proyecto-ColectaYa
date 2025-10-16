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
  | 'APPROVED' 
  | 'REJECTED' 
  | 'COMPLETED';

// ✅ ELIMINADO: CreateWithdrawalData ya no se usa (retiro inteligente sin body)

export interface WithdrawalListResponse {
  withdrawals: Withdrawal[];
  total: number;
}

// ✅ NUEVO: Respuesta del retiro inteligente
export interface IntelligentWithdrawResponse {
  message: string;
  action: 'TRANSFERRED' | 'REFUNDED';
  amount: number;
}
