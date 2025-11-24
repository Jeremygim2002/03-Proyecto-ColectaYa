import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({
    description: 'Monto de la contribución en USD',
    example: 10.0,
    minimum: 0.01,
  })
  @IsNotEmpty({ message: 'El monto es requerido' })
  @IsNumber({}, { message: 'El monto debe ser un número' })
  @Min(0.01, { message: 'El monto debe ser mayor a 0' })
  amount!: number;

  @ApiPropertyOptional({
    description: 'URL de retorno después del pago exitoso',
    example: 'https://localhost:5173/success',
  })
  @IsOptional()
  @IsString()
  returnUrl?: string;

  @ApiPropertyOptional({
    description: 'URL de retorno si el pago es cancelado',
    example: 'https://localhost:5173/cancel',
  })
  @IsOptional()
  @IsString()
  cancelUrl?: string;
}
