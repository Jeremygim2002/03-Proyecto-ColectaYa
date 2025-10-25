import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ContributionStatus, CollectionStatus } from '@prisma/client';

@Injectable()
export class ContributionsService {
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

    // Verificar acceso solo si es privada
    if (collection.isPrivate) {
      const isOwner = collection.ownerId === userId;
      const isMember = collection.members.length > 0;

      if (!isOwner && !isMember) {
        throw new ForbiddenException('No access to this private collection');
      }
    }
    // Para colecciones públicas, cualquier usuario autenticado puede contribuir

    // Simular pago exitoso (90% de éxito en lugar de 10%)
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
            name: true,
            avatar: true,
          },
        },
      },
    });

    // DEBUG: Verificar los datos del usuario
    console.log('DEBUG - User data in contribution:', {
      userId: contribution.userId,
      userName: contribution.user?.name,
      userAvatar: contribution.user?.avatar,
      userEmail: contribution.user?.email,
    });

    if (!paymentSuccess) {
      throw new BadRequestException('Payment failed - please try again');
    }

    return contribution;
  }

  async listContributions(collectionId: string, userId: string) {
    // Verificar que la colecta existe
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

    // Si es colección pública, cualquiera puede ver las contribuciones
    if (!collection.isPrivate) {
      // Listar contribuciones pagadas para colección pública
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
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    // Para colecciones privadas, verificar acceso
    const isOwner = collection.ownerId === userId;
    const isMember = collection.members.length > 0;

    if (!isOwner && !isMember) {
      throw new ForbiddenException('No access to this private collection');
    }

    // Listar contribuciones pagadas para colección privada
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
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getMyContributions(userId: string) {
    return this.prisma.contribution.findMany({
      where: {
        userId,
        status: ContributionStatus.PAID,
      },
      include: {
        collection: {
          select: {
            id: true,
            title: true,
            description: true,
            imageUrl: true,
            goalAmount: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
