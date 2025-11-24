import { Controller, Post, Body, Param, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { PayPalService } from './paypal.service';
import { CreateOrderDto, CaptureOrderDto } from './dto';

@ApiTags('paypal')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('collections/:collectionId/paypal')
export class PayPalController {
  constructor(private readonly paypalService: PayPalService) {}

  @Post('create-order')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Crear orden de pago en PayPal' })
  @ApiResponse({ status: 200, description: 'Orden creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Error al crear orden' })
  async createOrder(@Param('collectionId') collectionId: string, @Body() dto: CreateOrderDto) {
    const order = await this.paypalService.createOrder(dto.amount, collectionId, dto.returnUrl, dto.cancelUrl);

    return {
      id: order.id,
      status: order.status,
      links: order.links,
    };
  }

  @Post('capture-order')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Capturar pago de PayPal después de aprobación' })
  @ApiResponse({ status: 200, description: 'Pago capturado exitosamente' })
  @ApiResponse({ status: 400, description: 'Error al capturar pago' })
  async captureOrder(@Param('collectionId') collectionId: string, @Body() dto: CaptureOrderDto) {
    const capture = await this.paypalService.captureOrder(dto.orderId);

    const captureDetails = capture.purchase_units[0]?.payments?.captures[0];

    return {
      id: capture.id,
      status: capture.status,
      captureId: captureDetails?.id,
      amount: {
        value: captureDetails?.amount?.value,
        currency: captureDetails?.amount?.currency_code,
      },
    };
  }
}
