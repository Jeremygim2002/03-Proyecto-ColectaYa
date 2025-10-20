// Invitation domain types
export interface Invitation {
  id: string;
  collectionId: string;
  collectionTitle: string;
  collectionImageUrl: string;
  senderId: string;
  senderName: string;
  recipientEmail: string;
  status: InvitationStatus;
  message?: string;
  createdAt: string;
  expiresAt: string;
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
