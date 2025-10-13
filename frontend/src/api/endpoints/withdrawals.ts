import { httpClient } from '../client';
import { API_ENDPOINTS } from '@/constants';
import type {
  Withdrawal,
  WithdrawalListResponse,
  CreateWithdrawalData,
} from '@/types';

export const withdrawalsApi = {

  // List todos los retiros para una colección
  list: (collectionId: string): Promise<WithdrawalListResponse> => {
    return httpClient.get<WithdrawalListResponse>(
      API_ENDPOINTS.WITHDRAWALS.LIST(collectionId)
    );
  },

  // Request un retiro de una colección
  create: (collectionId: string, data: CreateWithdrawalData): Promise<Withdrawal> => {
    return httpClient.post<Withdrawal, CreateWithdrawalData>(
      API_ENDPOINTS.WITHDRAWALS.CREATE(collectionId),
      data
    );
  },
};
