import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ContributionStatus, CollectionStatus } from '@prisma/client';

@Injectable()
export class FundingService {
  constructor(private prisma: PrismaService) {}

  async contribute(collectionId: string, userId: string, amount: number) {
    // Verificar que la colecta existe y está activa
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

    if (collection.status !== CollectionStatus.ACTIVE) {
      throw new BadRequestException('Collection is not active');
    }

    // Verificar acceso si es privada
    if (collection.isPrivate) {
      const isOwner = collection.ownerId === userId;
      const isMember = collection.members.length > 0;

      if (!isOwner && !isMember) {
        throw new ForbiddenException('No access to this private collection');
      }
    }

    // Simular pago exitoso (en producción aquí iría integración con pasarela)
    const paymentSuccess = Math.random() > 0.1;

    // Crear contribución
    const contribution = await this.prisma.contribution.create({
      data: {
        collectionId,
        userId,
        amount,
        status: paymentSuccess ? ContributionStatus.PAID : ContributionStatus.FAILED,
        paymentRef: paymentSuccess ? `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` : null,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!paymentSuccess) {
      throw new BadRequestException('Payment failed - please try again');
    }

    return contribution;
  }

  async listContributions(collectionId: string, userId: string) {
    // Verificar acceso a la colecta
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

    // Verificar acceso si es privada
    if (collection.isPrivate) {
      const isOwner = collection.ownerId === userId;
      const isMember = collection.members.length > 0;

      if (!isOwner && !isMember) {
        throw new ForbiddenException('No access to this private collection');
      }
    }

    // Listar contribuciones pagadas
    return this.prisma.contribution.findMany({
      where: {
        collectionId,
        status: ContributionStatus.PAID,
      },
      include: {
        user: {
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
