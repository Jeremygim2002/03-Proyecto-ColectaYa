import { IsEmail, IsNotEmpty } from 'class-validator';

export class MagicLinkDto {
  @IsEmail({}, { message: 'Debe ser un email válido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email!: string;
}
