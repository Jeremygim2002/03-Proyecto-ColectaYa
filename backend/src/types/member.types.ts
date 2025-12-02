import { BasicUser } from './user.types';

export interface Member {
  id: string;
  collectionId: string;
  userId: string;
  user?: BasicUser;
  invitedAt: Date;
  acceptedAt?: Date;
  addedBy: string;
}

export interface InviteMemberData {
  email: string;
}

export interface MemberListResponse {
  members: Member[];
  total: number;
}

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
