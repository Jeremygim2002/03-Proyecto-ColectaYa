import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WithdrawalStatus, RuleType, ContributionStatus } from '@prisma/client';

@Injectable()
export class WithdrawalsService {
  constructor(private prisma: PrismaService) {}

  async requestWithdrawal(collectionId: string, userId: string, amount: number) {
    // Verificar que la colecta existe y que el usuario es el owner
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
      include: {
        contributions: {
          where: { status: ContributionStatus.PAID },
        },
      },
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    if (collection.ownerId !== userId) {
      throw new ForbiddenException('Only owner can request withdrawals');
    }

    // Calcular fondos disponibles
    const totalPaid = collection.contributions.reduce((sum, c) => sum + Number(c.amount), 0);
    const goalAmount = Number(collection.goalAmount);
    const progressPct = goalAmount > 0 ? (totalPaid / goalAmount) * 100 : 0;

    // Validar según tipo de regla
    switch (collection.ruleType) {
      case RuleType.GOAL_ONLY:
        if (progressPct < 100) {
          throw new BadRequestException('Cannot withdraw until goal is reached (100%)');
        }
        break;

      case RuleType.THRESHOLD: {
        const thresholdPct = Number(collection.ruleValue || 0); // ✅ CORREGIDO - Usar campo actualizado
        if (progressPct < thresholdPct) {
          throw new BadRequestException(`Cannot withdraw until threshold is reached (${thresholdPct}%)`);
        }
        break;
      }

      case RuleType.ANYTIME:
        // Permitido en cualquier momento
        break;

      default:
        throw new BadRequestException('Invalid rule type');
    }

    // Verificar que hay fondos suficientes
    if (amount > totalPaid) {
      throw new BadRequestException(`Insufficient funds. Available: ${totalPaid}`);
    }

    // Crear solicitud de retiro
    return this.prisma.withdrawal.create({
      data: {
        collectionId,
        requestedBy: userId,
        amount,
        status: WithdrawalStatus.REQUESTED,
      },
    });
  }

  async listWithdrawals(collectionId: string, userId: string) {
    // Verificar que la colecta existe y que el usuario es el owner
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    if (collection.ownerId !== userId) {
      throw new ForbiddenException('Only owner can view withdrawals');
    }

    // Listar retiros
    return this.prisma.withdrawal.findMany({
      where: { collectionId },
      include: {
        requester: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
