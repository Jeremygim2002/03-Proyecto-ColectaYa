import { IsEmail, IsString, IsUUID } from 'class-validator';

export class CreateInvitationDto {
  @IsString()
  @IsUUID()
  collectionId!: string;

  @IsEmail()
  invitedEmail!: string;
}
