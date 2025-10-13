import { IsEmail, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInvitationDto {
  @ApiProperty({
    description: 'ID de la colección',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsUUID()
  collectionId!: string;

  @ApiProperty({
    description: 'Email del usuario a invitar',
    example: 'usuario@ejemplo.com',
  })
  @IsEmail()
  invitedEmail!: string;
}
