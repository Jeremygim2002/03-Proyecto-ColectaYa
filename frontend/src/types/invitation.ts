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
  | 'PENDING'    // ✅ CORREGIDO: Backend usa PENDING (mayúscula)
  | 'ACCEPTED'   // ✅ CORREGIDO: Backend usa ACCEPTED (mayúscula)
  | 'REJECTED';  // ✅ CORREGIDO: Backend usa REJECTED (mayúscula)

export interface CreateInvitationData {
  collectionId: string;
  invitedEmail: string; // ✅ CORREGIDO: Backend espera invitedEmail no recipientEmail
  message?: string;
}

export interface InvitationResponse {
  message: string;
  // ✅ CORREGIDO: Respuestas diferentes para accept/reject según backend
}
