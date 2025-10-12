// ======================================================
// MEMBER TYPES - BACKEND
// ======================================================

import { BasicUser } from './user.types';

/**
 * Miembro de colecta con información del usuario
 * 🎯 DEBE coincidir exactamente con frontend
 */
export interface Member {
  id: string;
  collectionId: string;
  userId: string;
  user?: BasicUser;
  invitedAt: Date;
  acceptedAt?: Date; // 🔄 CONSISTENCIA: Optional en lugar de null
  addedBy: string;
}

/**
 * Datos para invitar miembro
 * 🎯 DEBE coincidir exactamente con frontend
 */
export interface InviteMemberData {
  email: string;
}

/**
 * Respuesta de lista de miembros
 * 🎯 DEBE coincidir exactamente con frontend
 */
export interface MemberListResponse {
  members: Member[];
  total: number;
}

/**
 * Miembro básico para listas
 * 🎯 DEBE coincidir exactamente con frontend
 */
export interface BasicMember {
  id: string;
  userId: string;
  acceptedAt?: Date; // 🔄 CONSISTENCIA: Optional en lugar de null
  user?: {
    id: string;
    email: string;
    name?: string;
  };
}