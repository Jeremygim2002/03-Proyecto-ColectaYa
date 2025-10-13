import { BasicUser } from './user.types';

//  Miembro de colecta con información del usuario
export interface Member {
  id: string;
  collectionId: string;
  userId: string;
  user?: BasicUser;
  invitedAt: Date;
  acceptedAt?: Date;
  addedBy: string;
}

//  Datos para invitar miembro
export interface InviteMemberData {
  email: string;
}

// Respuesta de lista de miembros
export interface MemberListResponse {
  members: Member[];
  total: number;
}

// Miembro básico para listas
export interface BasicMember {
  id: string;
  userId: string;
  acceptedAt?: Date;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
}
