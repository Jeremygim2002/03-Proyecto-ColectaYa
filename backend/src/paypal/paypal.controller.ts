import { Controller, Post, Body, Param, HttpCode, HttpStatus, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
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
  async createOrder(@Param('collectionId') collectionId: string, @Body() dto: CreateOrderDto) {
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

    const order = await this.paypalService.createOrder(dto.amount, collectionId, dto.returnUrl, dto.cancelUrl);

    return {
      id: order.id,
      status: order.status,
      links: order.links,
    };
  }

  @Post('capture-order')
  @HttpCode(HttpStatus.OK)
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
