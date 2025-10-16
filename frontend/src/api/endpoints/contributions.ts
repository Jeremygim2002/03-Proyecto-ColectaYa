import { httpClient } from '../client';
import { API_ENDPOINTS } from '@/constants';
import type {
  Contribution,
  CreateContributionData,
} from '@/types';

export const contributionsApi = {

  // Get todas las contribuciones para una colecta
  list: (collectionId: string): Promise<Contribution[]> => {
    return httpClient.get<Contribution[]>(
      API_ENDPOINTS.CONTRIBUTIONS.LIST(collectionId)
    );
  },

  // ✅ CORREGIDO: Create nueva contribución (endpoint correcto)
  create: (collectionId: string, data: CreateContributionData): Promise<Contribution> => {
    return httpClient.post<Contribution, CreateContributionData>(
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
