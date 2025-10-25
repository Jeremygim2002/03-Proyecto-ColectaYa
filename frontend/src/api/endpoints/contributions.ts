import { httpClient } from '../client';
import { API_ENDPOINTS } from '@/constants';
import type {
  Contribution,
} from '@/types';

export const contributionsApi = {

  // Get todas las contribuciones para una colecta
  list: (collectionId: string): Promise<Contribution[]> => {
    return httpClient.get<Contribution[]>(
      API_ENDPOINTS.CONTRIBUTIONS.LIST(collectionId)
    );
  },

  // ✅ CORREGIDO: Create nueva contribución (solo amount según backend DTO)
  create: (collectionId: string, data: { amount: number }): Promise<Contribution> => {
    return httpClient.post<Contribution, { amount: number }>(
      API_ENDPOINTS.CONTRIBUTIONS.CREATE(collectionId),
      data
    );
  },

  // ✅ NUEVO: Get mis contribuciones globales (para profile.tsx)
  getMyContributions: (): Promise<Contribution[]> => {
    return httpClient.get<Contribution[]>(
      API_ENDPOINTS.CONTRIBUTIONS.MY_CONTRIBUTIONS
    );
  },

  // ✅ ELIMINADO: get() y stats() no existen en backend
};
