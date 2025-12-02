import { IsNotEmpty, IsString } from 'class-validator';

export class CaptureOrderDto {
  @IsNotEmpty({ message: 'El orderId es requerido' })
  @IsString({ message: 'El orderId debe ser un string' })
  orderId!: string;
}
