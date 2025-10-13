import { httpClient } from '../client';
import { API_ENDPOINTS } from '@/constants';
import type {
  Collection,
  CollectionListResponse,
  CreateCollectionData,
  UpdateCollectionData,
  CollectionFilters,
} from '@/types';

export const collectionsApi = {
  
    // Get  colectas del usuario con filtros opcionales
  list: (filters?: CollectionFilters): Promise<CollectionListResponse> => {
    return httpClient.get<CollectionListResponse>(
      API_ENDPOINTS.COLLECTIONS.LIST,
      { params: filters as Record<string, string | number | boolean> }
    );
  },


    // Get colecta públicas para explorar
  explore: (filters?: CollectionFilters): Promise<CollectionListResponse> => {
    return httpClient.get<CollectionListResponse>(
      API_ENDPOINTS.COLLECTIONS.EXPLORE,
      { 
        params: filters as Record<string, string | number | boolean>,
        requiresAuth: false,
      }
    );
  },

  
    // Get una colecta única por ID
  get: (id: string): Promise<Collection> => {
    return httpClient.get<Collection>(API_ENDPOINTS.COLLECTIONS.GET(id));
  },


  //  Create nueva colecta
  create: (data: CreateCollectionData): Promise<Collection> => {
    return httpClient.post<Collection, CreateCollectionData>(
      API_ENDPOINTS.COLLECTIONS.CREATE,
      data
    );
  },

  
    // Update colecta
  update: (id: string, data: UpdateCollectionData): Promise<Collection> => {
    return httpClient.patch<Collection, UpdateCollectionData>(
      API_ENDPOINTS.COLLECTIONS.UPDATE(id),
      data
    );
  },

  // Delete colecta
  delete: (id: string): Promise<void> => {
    return httpClient.delete<void>(API_ENDPOINTS.COLLECTIONS.DELETE(id));
  },
};
