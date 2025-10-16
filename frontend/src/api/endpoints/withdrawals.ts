import { httpClient } from '../client';
import { API_ENDPOINTS } from '@/constants';
import type {
  WithdrawalListResponse,
  IntelligentWithdrawResponse,
} from '@/types';

export const withdrawalsApi = {

  // List todos los retiros para una colección
  list: (collectionId: string): Promise<WithdrawalListResponse> => {
    return httpClient.get<WithdrawalListResponse>(
      API_ENDPOINTS.WITHDRAWALS.LIST(collectionId)
    );
  },

  // ✅ CORREGIDO: Retiro inteligente (sin body, solo owner)
  intelligentWithdraw: (collectionId: string): Promise<IntelligentWithdrawResponse> => {
    return httpClient.post<IntelligentWithdrawResponse>(
      API_ENDPOINTS.WITHDRAWALS.INTELLIGENT_WITHDRAW(collectionId)
    );
  },

  // ✅ ELIMINADO: create() con amount - Ahora es retiro inteligente automático
};
