import { httpClient } from '../client';
import { API_ENDPOINTS } from '@/constants';
import type {
  Member,
  MemberListResponse,
  InviteMemberData,
} from '@/types';


export const membersApi = {

  // List Todos los miembros de una colección
  list: (collectionId: string): Promise<MemberListResponse> => {
    return httpClient.get<MemberListResponse>(
      API_ENDPOINTS.MEMBERS.LIST(collectionId)
    );
  },

  // Invitar a un miembro de una colección
  invite: (collectionId: string, data: InviteMemberData): Promise<Member> => {
    return httpClient.post<Member, InviteMemberData>(
      API_ENDPOINTS.MEMBERS.INVITE(collectionId),
      data
    );
  },

  // Accept la invitacion de union a la colecta
  accept: (collectionId: string): Promise<Member> => {
    return httpClient.post<Member, never>(
      API_ENDPOINTS.MEMBERS.ACCEPT(collectionId),
      undefined
    );
  },

  // Remove a un miembro de la colecta
  remove: (collectionId: string, userId: string): Promise<void> => {
    return httpClient.delete<void>(
      API_ENDPOINTS.MEMBERS.REMOVE(collectionId, userId)
    );
  },
};
