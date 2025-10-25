// Invitation domain types
export interface Invitation {
  id: string;
  status: InvitationStatus;
  createdAt: string;
  respondedAt: string | null;
  collection: {
    id: string;
    title: string;
    description: string | null;
    imageUrl: string | null;
  };
  inviter: {
    id: string;
    name: string | null;
    email: string;
  };
}

export type InvitationStatus = 
  | 'PENDING'    
  | 'ACCEPTED'   
  | 'REJECTED'; 

export interface CreateInvitationData {
  collectionId: string;
  invitedEmail: string; 
  message?: string;
}

export interface InvitationResponse {
  message: string;
}
