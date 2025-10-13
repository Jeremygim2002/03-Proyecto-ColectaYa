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


  // Responder a la invitacion (accept/decline)
  respond: (id: string, accepted: boolean): Promise<InvitationResponse> => {
    return httpClient.post<InvitationResponse, { accepted: boolean }>(
      API_ENDPOINTS.INVITATIONS.RESPOND(id),
      { accepted }
    );
  },


    // Delete invitacion
  delete: (id: string): Promise<void> => {
    return httpClient.delete<void>(API_ENDPOINTS.INVITATIONS.DELETE(id));
  },
};
