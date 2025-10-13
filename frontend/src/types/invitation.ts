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
  | 'pending'
  | 'accepted' 
  | 'declined';

export interface CreateInvitationData {
  collectionId: string;
  recipientEmail: string;
  message?: string;
}

export interface InvitationResponse {
  collectionId: string;
  accepted: boolean;
}
