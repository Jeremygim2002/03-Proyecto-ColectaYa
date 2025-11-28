import { Controller, Post, Body, Param, HttpCode, HttpStatus, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { PayPalService } from './paypal.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto, CaptureOrderDto } from './dto';

@ApiTags('paypal')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('collections/:collectionId/paypal')
export class PayPalController {
  constructor(
    private readonly paypalService: PayPalService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('create-order')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Crear orden de pago en PayPal' })
  @ApiResponse({ status: 200, description: 'Orden creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Error al crear orden' })
  async createOrder(@Param('collectionId') collectionId: string, @Body() dto: CreateOrderDto) {
    // 🔍 Validar que el monto no exceda el disponible ANTES de crear la orden
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
      include: {
        contributions: {
          where: { status: 'PAID' },
        },
      },
    });

    if (!collection) {
      throw new BadRequestException('Colecta no encontrada');
    }

    // Calcular monto total recaudado
    const totalRaised = collection.contributions.reduce((sum, c) => sum + Number(c.amount), 0);
    const goalAmount = Number(collection.goalAmount);
    const availableAmount = Math.max(0, goalAmount - totalRaised);

    // Validar que el monto a aportar no exceda lo disponible
    if (dto.amount > availableAmount) {
      throw new BadRequestException(
        `El monto a contribuir (S/ ${dto.amount.toFixed(2)}) excede el monto disponible (S/ ${availableAmount.toFixed(2)}). ` +
          `Meta: S/ ${goalAmount.toFixed(2)}, Recaudado: S/ ${totalRaised.toFixed(2)}`,
      );
    }

    if (availableAmount <= 0) {
      throw new BadRequestException(
        `La colecta ya alcanzó su meta de S/ ${goalAmount.toFixed(2)}. No se pueden realizar más contribuciones.`,
      );
    }

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
