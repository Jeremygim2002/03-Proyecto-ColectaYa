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
    members: {
      select: {
        userId: true;
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
    // Validar existencia del owner para evitar error 500 por FK
    const owner = await this.prisma.user.findUnique({ where: { id: ownerId } });
    if (!owner) {
      throw new NotFoundException('Owner user not found');
    }

    try {
      // Crear colecta - Todas las colectas son privadas por defecto
      const newCollection = await this.prisma.collection.create({
        data: {
          owner: { connect: { id: ownerId } },
          title: dto.title,
          description: dto.description,
          imageUrl: dto.imageUrl,
          isPrivate: true, // Forzar que todas las colectas sean privadas
          goalAmount: dto.goalAmount,
          ruleType: dto.ruleType,
          ruleValue: dto.ruleValue,
          deadlineAt: dto.deadlineAt ? new Date(dto.deadlineAt) : undefined,
        },
      });

      return newCollection;
    } catch (err: unknown) {
      // Log detallado para diagnóstico en desarrollo
      console.error('[CollectionsService.create] Prisma error:', err);
      // Prisma errores comunes: P2002 unique, P2003 FK, etc.
      const code =
        typeof err === 'object' && err && 'code' in err
          ? ((err as Record<string, unknown>)['code'] as string)
          : undefined;
      if (code === 'P2003') {
        // Violación de FK
        throw new BadRequestException('Invalid relation: owner not found or invalid reference');
      }
      if (code === 'P2002') {
        throw new BadRequestException('Duplicate value violates a unique constraint');
      }
      // Re-lanzar con detalle para depuración en desarrollo
      throw err;
    }
  }

  // Método para preview/compartir - permite ver cualquier colecta vía link
  async findOneForPreview(id: string, userId?: string) {
    const collection = await this.prisma.collection.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
            roles: true,
          },
        },
        members: {
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
        },
        contributions: {
          where: { status: 'PAID' },
          select: {
            amount: true,
            userId: true,
          },
        },
      },
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    // NO verificar permisos - permitir ver cualquier colecta vía link de compartir
    // Esto permite que alguien con el link pueda ver la colecta antes de unirse

    // Calcular progreso y estadísticas
    const totalPaid = collection.contributions.reduce((sum, c) => sum + Number(c.amount), 0);
    const goalAmount = Number(collection.goalAmount);
    const progress = goalAmount > 0 ? (totalPaid / goalAmount) * 100 : 0;

    // Calcular número único de contribuyentes
    const uniqueContributors = new Set(collection.contributions.map((c) => c.userId).filter(Boolean)).size;

    return {
      ...collection,
      currentAmount: totalPaid,
      contributorsCount: uniqueContributors,
      progress: Math.min(progress, 100),
    };
  }

  async findOne(id: string, userId?: string) {
    const collection = await this.prisma.collection.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
            roles: true,
          },
        },
        members: {
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
        },
        contributions: {
          where: { status: 'PAID' },
          select: {
            amount: true,
            userId: true,
          },
        },
      },
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    // Verificar acceso a colectas privadas
    if (collection.isPrivate) {
      // Si la colecta es privada y no hay usuario autenticado, denegar acceso
      if (!userId) {
        throw new ForbiddenException('Authentication required to view private collection');
      }

      const isOwner = collection.ownerId === userId;
      const isMember = collection.members.some((m) => m.userId === userId && m.acceptedAt !== null);

      if (!isOwner && !isMember) {
        throw new ForbiddenException('No access to this private collection');
      }
    }

    // Calcular progreso y estadísticas
    const totalPaid = collection.contributions.reduce((sum, c) => sum + Number(c.amount), 0);
    const goalAmount = Number(collection.goalAmount);
    const progress = goalAmount > 0 ? (totalPaid / goalAmount) * 100 : 0;

    // Calcular número único de contribuyentes
    const uniqueContributors = new Set(collection.contributions.map((c) => c.userId).filter(Boolean)).size;

    console.log('DEBUG - Collection calculations:', {
      totalPaid,
      goalAmount,
      progress,
      contributorsCount: uniqueContributors,
      contributionsCount: collection.contributions.length,
    });

    return {
      ...collection,
      currentAmount: totalPaid,
      contributorsCount: uniqueContributors,
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

  async findUserCollections(userId: string, filters?: { search?: string; status?: CollectionStatus }) {
    // Primero actualizar automáticamente el status de las colectas
    await this.updateCollectionStatuses();

    const where: Prisma.CollectionWhereInput = {
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
    };

    // Aplicar filtro de estado si se proporciona
    if (filters?.status) {
      where.status = filters.status;
    }

    // Aplicar búsqueda en título/descripcion si se proporciona
    if (filters?.search) {
      // Normalize existing AND to an array if needed
      const existingAnd = Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : [];
      where.AND = [
        ...existingAnd,
        {
          OR: [
            { title: { contains: filters.search, mode: 'insensitive' } },
            { description: { contains: filters.search, mode: 'insensitive' } },
          ],
        },
      ];
    }

    const collections = await this.prisma.collection.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
          },
        },
        members: {
          where: { acceptedAt: { not: null } },
          select: {
            userId: true,
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calcular estadísticas para cada colecta (igual que findPublicCollections)
    const collectionsWithStats: CollectionWithStats[] = collections.map((collection) => {
      const validContributions = collection.contributions || [];
      const currentAmount = validContributions.reduce((sum, contrib) => {
        return sum + Number(contrib.amount);
      }, 0);

      // Contar miembros: owner siempre cuenta + miembros aceptados que no sean el owner
      const acceptedMembers = collection.members || [];
      const memberIds = new Set(acceptedMembers.map((m) => m.userId));
      // Asegurar que el owner siempre se cuente
      memberIds.add(collection.ownerId);
      const memberCount = memberIds.size;

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
        contributorsCount: memberCount,
        progress: Math.round(progress * 100) / 100,
      };
    });

    return {
      collections: collectionsWithStats,
      total: collectionsWithStats.length,
    };
  }

  async findPublicCollections(filters: GetPublicCollectionsDto): Promise<PublicCollectionsResponse> {
    // Primero actualizar automáticamente el status de las colectas
    await this.updateCollectionStatuses();

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
          members: {
            where: { acceptedAt: { not: null } },
            select: {
              userId: true,
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

        // Contar miembros: owner siempre cuenta + miembros aceptados que no sean el owner
        const acceptedMembers = collection.members || [];
        const memberIds = new Set(acceptedMembers.map((m) => m.userId));
        // Asegurar que el owner siempre se cuente
        memberIds.add(collection.ownerId);
        const memberCount = memberIds.size;

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
          contributorsCount: memberCount,
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

  async joinCollection(collectionId: string, userId: string, fromSharedLink: boolean = false) {
    // Verificar que la colección existe
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
      include: {
        members: true,
      },
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    // Si es privada y NO viene del link compartido, requerir invitación
    if (collection.isPrivate && !fromSharedLink) {
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

  async leaveCollection(collectionId: string, userId: string) {
    // Buscar la membresía del usuario en la colección
    const member = await this.prisma.collectionMember.findFirst({
      where: {
        collectionId,
        userId,
      },
    });

    if (!member) {
      throw new NotFoundException('You are not a member of this collection');
    }

    // Eliminar la membresía
    await this.prisma.collectionMember.delete({
      where: {
        id: member.id,
      },
    });
  }

  // Función para actualizar automáticamente el status de las colectas
  private async updateCollectionStatuses() {
    // Obtener todas las colectas ACTIVE
    const activeCollections = await this.prisma.collection.findMany({
      where: {
        status: CollectionStatus.ACTIVE,
      },
      include: {
        contributions: {
          where: {
            status: 'PAID',
          },
        },
      },
    });

    // Actualizar status de las colectas que han alcanzado la meta
    for (const collection of activeCollections) {
      const totalContributions = collection.contributions.reduce(
        (sum, contribution) => sum + Number(contribution.amount),
        0,
      );

      // Si alcanzó la meta (100%), cambiar a COMPLETED
      if (totalContributions >= Number(collection.goalAmount)) {
        await this.prisma.collection.update({
          where: { id: collection.id },
          data: { status: CollectionStatus.COMPLETED },
        });
      }
    }
  }
}
