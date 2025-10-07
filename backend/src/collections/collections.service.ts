import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCollectionDto, UpdateCollectionDto } from './dto';
import { Collection, CollectionStatus } from '@prisma/client';

@Injectable()
export class CollectionsService {
  constructor(private prisma: PrismaService) {}

  async create(ownerId: string, dto: CreateCollectionDto): Promise<Collection> {
    return this.prisma.collection.create({
      data: {
        title: dto.name,
        description: dto.description,
        goalAmount: dto.goalAmount,
        ruleType: dto.ruleType,
        thresholdPct: dto.ruleValue,
        isPrivate: dto.isPrivate ?? false,
        ownerId,
        status: CollectionStatus.ACTIVE,
      },
    });
  }

  async findOne(id: string, userId: string) {
    const collection = await this.prisma.collection.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            roles: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
        contributions: {
          where: { status: 'PAID' },
          select: {
            amount: true,
          },
        },
      },
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    // Verificar acceso a colectas privadas
    if (collection.isPrivate) {
      const isOwner = collection.ownerId === userId;
      const isMember = collection.members.some((m) => m.userId === userId && m.acceptedAt !== null);

      if (!isOwner && !isMember) {
        throw new ForbiddenException('No access to this private collection');
      }
    }

    // Calcular progreso
    const totalPaid = collection.contributions.reduce((sum, c) => sum + Number(c.amount), 0);
    const goalAmount = Number(collection.goalAmount);
    const progress = goalAmount > 0 ? (totalPaid / goalAmount) * 100 : 0;

    return {
      ...collection,
      currentAmount: totalPaid,
      progress: Math.min(progress, 100),
    };
  }

  async update(id: string, userId: string, dto: UpdateCollectionDto): Promise<Collection> {
    const collection = await this.prisma.collection.findUnique({
      where: { id },
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    if (collection.ownerId !== userId) {
      throw new ForbiddenException('Only owner can update collection');
    }

    return this.prisma.collection.update({
      where: { id },
      data: {
        title: dto.name,
        description: dto.description,
        goalAmount: dto.goalAmount,
        ruleType: dto.ruleType,
        thresholdPct: dto.ruleValue,
        isPrivate: dto.isPrivate,
      },
    });
  }

  async delete(id: string, userId: string): Promise<void> {
    const collection = await this.prisma.collection.findUnique({
      where: { id },
      include: {
        contributions: {
          where: { status: 'PAID' },
        },
      },
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    if (collection.ownerId !== userId) {
      throw new ForbiddenException('Only owner can delete collection');
    }

    if (collection.contributions.length > 0) {
      throw new BadRequestException('Cannot delete collection with paid contributions');
    }

    await this.prisma.collection.delete({
      where: { id },
    });
  }

  async findUserCollections(userId: string) {
    return this.prisma.collection.findMany({
      where: {
        OR: [
          { ownerId: userId },
          {
            members: {
              some: {
                userId,
                acceptedAt: { not: null },
              },
            },
          },
        ],
      },
      include: {
        owner: {
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
