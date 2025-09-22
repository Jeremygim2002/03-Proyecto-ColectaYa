import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignInDto {
  @ApiProperty({ example: 'usuario@ejemplo.com' })
  @IsEmail({}, { message: 'Debe ser un email válido' })
  email!: string;

  @ApiProperty({ example: 'miPasswordSegura123' })
  @IsString({ message: 'La contraseña es requerida' })
  @MinLength(1, { message: 'La contraseña no puede estar vacía' })
  password!: string;
}
