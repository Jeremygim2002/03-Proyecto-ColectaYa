import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RuleType } from '@prisma/client';

@Injectable()
export class WithdrawalsService {
  constructor(private prisma: PrismaService) {}

  async createWithdrawal(collectionId: string, userId: string) {
    // Verificar que la colecta existe y obtener contribuciones y retiros para calcular el monto disponible
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
      include: {
        contributions: {
          where: {
            status: 'PAID',
          },
        },
        withdrawals: {
          where: {
            status: 'PAID', // Solo contar retiros ya pagados
          },
        },
      },
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    // Verificar que el usuario es el owner
    if (collection.ownerId !== userId) {
      throw new ForbiddenException('Only the collection owner can create withdrawals');
    }

    // Calcular el monto total de contribuciones
    const totalContributions = collection.contributions.reduce((sum, c) => sum + Number(c.amount), 0);

    // Calcular el monto total de retiros ya realizados
    const totalWithdrawals = collection.withdrawals.reduce((sum, w) => sum + Number(w.amount), 0);

    // 🔍 Validación PRINCIPAL: Solo permitir UN retiro por colecta, sin importar el estado
    const allWithdrawals = await this.prisma.withdrawal.findMany({
      where: { collectionId },
    });

    if (allWithdrawals.length > 0) {
      const existingWithdrawal = allWithdrawals[0];
      throw new BadRequestException(
        `Ya existe un retiro solicitado para esta colecta. ` +
          `Estado: ${existingWithdrawal.status}, Monto: S/ ${Number(existingWithdrawal.amount).toFixed(2)}. ` +
          `Solo se permite un retiro por colecta.`,
      );
    }

    // Calcular el monto disponible para retirar
    const availableAmount = totalContributions - totalWithdrawals;

    // Verificar que hay fondos para retirar
    if (availableAmount <= 0) {
      throw new BadRequestException('No hay fondos disponibles para retirar');
    }

    // Verificar reglas de retiro según RuleType
    if (collection.ruleType === RuleType.GOAL_ONLY) {
      // Solo puede retirar si se alcanzó la meta
      if (totalContributions < Number(collection.goalAmount)) {
        const message = `No puedes retirar fondos. La meta aún no se ha alcanzado. Actual: S/ ${totalContributions}, Meta: S/ ${Number(collection.goalAmount)}`;
        throw new BadRequestException(message);
      }
    }

    // Crear el retiro por el monto total disponible
    return this.prisma.withdrawal.create({
      data: {
        collectionId,
        requestedBy: userId,
        amount: availableAmount, // Retirar todo lo disponible
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        collection: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  async listWithdrawals(collectionId: string, userId: string) {
    // Verificar acceso a la colecta (owner o miembro)
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
      include: {
        members: {
          where: {
            userId,
            acceptedAt: { not: null },
          },
        },
      },
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    const isOwner = collection.ownerId === userId;
    const isMember = collection.members.length > 0;

    if (!isOwner && !isMember) {
      throw new ForbiddenException('No access to this collection');
    }

    // Listar retiros
    return this.prisma.withdrawal.findMany({
      where: { collectionId },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
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
