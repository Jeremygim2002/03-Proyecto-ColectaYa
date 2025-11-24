import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CaptureOrderDto {
  @ApiProperty({
    description: 'ID de la orden de PayPal a capturar',
    example: 'PAYPAL-ORDER-ID-123456',
  })
  @IsNotEmpty({ message: 'El orderId es requerido' })
  @IsString({ message: 'El orderId debe ser un string' })
  orderId!: string;
}
