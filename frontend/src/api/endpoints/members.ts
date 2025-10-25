import { httpClient } from '../client';
import { API_ENDPOINTS } from '@/constants';
import type {
  MemberListResponse,
} from '@/types';

export const membersApi = {

  // List Todos los miembros de una colección
  list: (collectionId: string): Promise<MemberListResponse> => {
    return httpClient.get<MemberListResponse>(
      API_ENDPOINTS.MEMBERS.LIST(collectionId)
    );
  },

  // ✅ ELIMINADO: invite() - Ahora se usa invitationsApi.create()
  // ✅ ELIMINADO: accept() - Ahora se usa collectionsApi.join()

  // Remove a un miembro de la colecta (solo owner)
  remove: (collectionId: string, userId: string): Promise<void> => {
    return httpClient.delete<void>(
      API_ENDPOINTS.MEMBERS.REMOVE(collectionId, userId)
    );
  },

  // Leave - Dejar una colecta (solo miembros, no owner)
  leave: (collectionId: string): Promise<void> => {
    return httpClient.delete<void>(
      API_ENDPOINTS.MEMBERS.LIST(collectionId)
    );
  },
};
