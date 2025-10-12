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

export interface InviteMemberData {
  email: string;
}

export interface MemberListResponse {
  members: Member[];
  total: number;
}
