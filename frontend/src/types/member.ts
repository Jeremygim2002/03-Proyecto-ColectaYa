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


export interface MemberListResponse {
  members: Member[];
  total: number;
}

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

export interface LeaveCollectionResponse {
  message: string;
}
