// Member domain types
export interface Member {
  id: string;
  collectionId: string;
  userId: string;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
  invitedAt: string;
  acceptedAt: string | null;
  addedBy: string;
}

// ✅ ELIMINADO: InviteMemberData ya no se usa (se usa invitationsApi.create())

export interface MemberListResponse {
  members: Member[];
  total: number;
}

// ✅ NUEVO: Respuesta al unirse a una colección
export interface JoinCollectionResponse {
  message: string;
  member: {
    id: string;
    userId: string;
    collectionId: string;
    joinedAt: string;
    user: {
      id: string;
      name?: string;
      email: string;
      avatar?: string;
    };
    collection: {
      id: string;
      title: string;
      description?: string;
    };
  };
}

// ✅ NUEVO: Respuesta al salirse de una colección
export interface LeaveCollectionResponse {
  message: string;
}
