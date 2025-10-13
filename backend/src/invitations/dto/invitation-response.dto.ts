import { ApiProperty } from '@nestjs/swagger';
import { InvitationStatus } from '@prisma/client';

export class InvitationResponseDto {
  @ApiProperty({
    description: 'ID de la invitación',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string;

  @ApiProperty({
    description: 'Estado de la invitación',
    enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
  })
  status!: InvitationStatus;

  @ApiProperty({
    description: 'Fecha de creación',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Fecha de respuesta (si existe)',
    nullable: true,
  })
  respondedAt!: Date | null;

  @ApiProperty({
    description: 'Información de la colección',
  })
  collection!: {
    id: string;
    title: string;
    description: string | null;
    imageUrl: string | null;
  };

  @ApiProperty({
    description: 'Información del usuario que invita',
  })
  inviter!: {
    id: string;
    name: string | null;
    email: string;
  };
}
