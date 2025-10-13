import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCollectionDto, UpdateCollectionDto, GetPublicCollectionsDto, PublicCollectionFilter } from './dto';
import { Collection, CollectionStatus, Prisma } from '@prisma/client';
import { CollectionWithStats, PublicCollectionsResponse } from '../types';

// Tipo para el resultado de la query con includes
type CollectionWithIncludesForPublic = Prisma.CollectionGetPayload<{
  include: {
    owner: {
      select: {
        id: true;
        email: true;
        name: true;
        avatar: true;
      };
    };
    contributions: {
      select: {
        amount: true;
        userId: true;
      };
    };
  };
}>;

@Injectable()
export class CollectionsService {
  constructor(private prisma: PrismaService) {}

  async create(ownerId: string, dto: CreateCollectionDto): Promise<Collection> {
    // Temporalmente sin imageUrl hasta regenerar Prisma
    const newCollection = await this.prisma.collection.create({
      data: {
        ownerId: ownerId,
        title: dto.title,
        description: dto.description,
        imageUrl: dto.imageUrl,
        isPrivate: dto.isPrivate,
        goalAmount: dto.goalAmount,
        ruleType: dto.ruleType,
        ruleValue: dto.ruleValue,
        deadlineAt: dto.deadlineAt,
      },
    });

    return newCollection;
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
        title: dto.title,
        description: dto.description,
        imageUrl: dto.imageUrl,
        goalAmount: dto.goalAmount,
        ruleType: dto.ruleType,
        ruleValue: dto.ruleValue,
        isPrivate: dto.isPrivate,
        status: dto.status,
        deadlineAt: dto.deadlineAt ? new Date(dto.deadlineAt) : undefined,
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

  async findPublicCollections(filters: GetPublicCollectionsDto): Promise<PublicCollectionsResponse> {
    const { search, status, skip, take } = filters;

    // Colectas publicas o privadas
    const whereCondition: {
      isPrivate: boolean;
      status?: CollectionStatus;
      OR?: Array<
        | { title?: { contains: string; mode: 'insensitive' } }
        | { description?: { contains: string; mode: 'insensitive' } }
      >;
    } = {
      isPrivate: false, // Solo colectas públicas
    };

    // Filtro por estado
    if (status && status !== PublicCollectionFilter.TODOS) {
      whereCondition.status = status as CollectionStatus; // 'ACTIVE' o 'COMPLETED'
    }
    // Si es TODOS, no agregamos filtro de status (muestra ambos)

    // Filtro de búsqueda en título y descripción
    if (search) {
      whereCondition.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Ejecutar query con paginación
    const [collections, total] = await Promise.all([
      this.prisma.collection.findMany({
        where: whereCondition,
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              name: true,
              avatar: true,
            },
          },
          contributions: {
            where: { status: 'PAID' },
            select: {
              amount: true,
              userId: true,
            },
          },
        },
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.collection.count({
        where: whereCondition,
      }),
    ]);

    // Calcular estadísticas para cada colecta
    const collectionsWithStats: CollectionWithStats[] = collections.map(
      (collection: CollectionWithIncludesForPublic) => {
        const validContributions = collection.contributions || [];
        const currentAmount = validContributions.reduce((sum, contrib) => {
          return sum + Number(contrib.amount);
        }, 0);
        const contributorsCount = new Set(validContributions.map((c) => c.userId)).size;
        const progress = collection.goalAmount ? (currentAmount / Number(collection.goalAmount)) * 100 : 0;

        return {
          id: collection.id,
          title: collection.title,
          description: collection.description ?? undefined,
          imageUrl: collection.imageUrl ?? undefined,
          isPrivate: collection.isPrivate,
          goalAmount: Number(collection.goalAmount),
          currency: 'PEN' as const,
          ruleType: collection.ruleType,
          ruleValue: collection.ruleValue ? Number(collection.ruleValue) : undefined,
          status: collection.status,
          deadlineAt: collection.deadlineAt ?? undefined,
          createdAt: collection.createdAt,
          updatedAt: collection.updatedAt,
          owner: {
            id: collection.owner.id,
            email: collection.owner.email,
            name: collection.owner.name ?? undefined,
            avatar: collection.owner.avatar ?? undefined,
          },
          currentAmount,
          contributorsCount,
          progress: Math.round(progress * 100) / 100,
        };
      },
    );

    return {
      collections: collectionsWithStats,
      total,
      page: filters.page || 1,
      limit: filters.limit || 12,
      hasNextPage: skip + take < total,
    };
  }

  async joinCollection(collectionId: string, userId: string) {
    // Verificar que la colección existe y es pública
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
      include: {
        members: true,
      },
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    if (collection.isPrivate) {
      throw new BadRequestException('Cannot join private collection directly - an invitation is required');
    }

    if (collection.status !== CollectionStatus.ACTIVE) {
      throw new BadRequestException('Collection is not active');
    }

    // Verificar que no sea el owner
    if (collection.ownerId === userId) {
      throw new BadRequestException('You are already the owner of this collection');
    }

    // Verificar que no sea ya miembro
    const existingMember = collection.members.find((member) => member.userId === userId);
    if (existingMember) {
      throw new BadRequestException('You are already a member of this collection');
    }

    // Agregar como miembro
    const member = await this.prisma.collectionMember.create({
      data: {
        collectionId,
        userId,
        acceptedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        collection: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
      },
    });

    return {
      message: 'Successfully joined the collection',
      member: {
        id: member.id,
        userId: member.userId,
        collectionId: member.collectionId,
        joinedAt: member.acceptedAt,
        user: member.user,
        collection: member.collection,
      },
    };
  }
}
