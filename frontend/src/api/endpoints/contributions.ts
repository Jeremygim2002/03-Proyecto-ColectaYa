import { httpClient } from '../client';
import { API_ENDPOINTS } from '@/constants';
import type {
  Contribution,
  CreateContributionData,
  ContributionStats,
} from '@/types';

export const contributionsApi = {

  //  Get todas las contribuciones para una colecta
  list: (collectionId: string): Promise<Contribution[]> => {
    return httpClient.get<Contribution[]>(
      API_ENDPOINTS.CONTRIBUTIONS.LIST(collectionId)
    );
  },


  //  Get estadísticas de contribución para una colección
  stats: (collectionId: string): Promise<ContributionStats> => {
    return httpClient.get<ContributionStats>(
      API_ENDPOINTS.CONTRIBUTIONS.STATS(collectionId)
    );
  },


  // Create nueva contribución 
  create: (collectionId: string, data: CreateContributionData): Promise<Contribution> => {
    return httpClient.post<Contribution, CreateContributionData>(
      API_ENDPOINTS.CONTRIBUTIONS.LIST(collectionId),
      data
    );
  },

  // Get aporte único por ID
  get: (id: string): Promise<Contribution> => {
    return httpClient.get<Contribution>(
      API_ENDPOINTS.CONTRIBUTIONS.GET(id)
    );
  },
};
