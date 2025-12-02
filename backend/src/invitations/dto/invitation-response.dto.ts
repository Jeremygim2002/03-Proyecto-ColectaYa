import { InvitationStatus } from '@prisma/client';

export class InvitationResponseDto {
  id!: string;
  status!: InvitationStatus;
  createdAt!: Date;
  respondedAt!: Date | null;
  collection!: {
    id: string;
    title: string;
    description: string | null;
    imageUrl: string | null;
  };
  inviter!: {
    id: string;
    name: string | null;
    email: string;
  };
}
