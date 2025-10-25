import { httpClient } from '../client';
import { API_ENDPOINTS } from '@/constants';

export interface Withdrawal {
  id: string;
  collectionId: string;
  requestedBy: string;
  amount: number;
  status: 'REQUESTED' | 'PAID' | 'REJECTED';
  createdAt: string;
  processedAt?: string;
  requester: {
    id: string;
    name?: string;
    email: string;
  };
}

export const withdrawalsApi = {
  // Create withdrawal (retiro total)
  create: (collectionId: string): Promise<Withdrawal> => {
    return httpClient.post<Withdrawal>(
      API_ENDPOINTS.WITHDRAWALS.CREATE(collectionId)
    );
  },

  // List withdrawals
  list: (collectionId: string): Promise<Withdrawal[]> => {
    return httpClient.get<Withdrawal[]>(
      API_ENDPOINTS.WITHDRAWALS.LIST(collectionId)
    );
  },
};
