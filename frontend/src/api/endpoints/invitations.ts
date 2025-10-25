import { httpClient } from '../client';
import { API_ENDPOINTS } from '@/constants';
import type {
  Invitation,
  CreateInvitationData,
  InvitationResponse,
} from '@/types';

export const invitationsApi = {
  
  // Get Todas las invitaciones para el usuario actual.
  list: (): Promise<Invitation[]> => {
    return httpClient.get<Invitation[]>(API_ENDPOINTS.INVITATIONS.LIST);
  },

  // Create nueva invitacion
  create: (data: CreateInvitationData): Promise<Invitation> => {
    return httpClient.post<Invitation, CreateInvitationData>(
      API_ENDPOINTS.INVITATIONS.CREATE,
      data
    );
  },

  // ✅ CORREGIDO: Aceptar invitación (endpoint separado)
  accept: (id: string): Promise<InvitationResponse> => {
    return httpClient.put<InvitationResponse>(
      API_ENDPOINTS.INVITATIONS.ACCEPT(id)
    );
  },

  // ✅ CORREGIDO: Rechazar invitación (endpoint separado)
  reject: (id: string): Promise<InvitationResponse> => {
    return httpClient.put<InvitationResponse>(
      API_ENDPOINTS.INVITATIONS.REJECT(id)
    );
  },

  // Helper method for the hook
  respond: (id: string, accepted: boolean): Promise<InvitationResponse> => {
    return accepted ? invitationsApi.accept(id) : invitationsApi.reject(id);
  },
};
