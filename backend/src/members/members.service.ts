import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MembersService {
  constructor(private prisma: PrismaService) {}

  async invite(collectionId: string, ownerId: string, email: string) {
    // Verificar que la colecta existe y que el usuario es el owner
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    if (collection.ownerId !== ownerId) {
      throw new ForbiddenException('Only owner can invite members');
    }

    // Buscar usuario por email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found with that email');
    }

    if (user.id === ownerId) {
      throw new BadRequestException('Owner cannot be added as member');
    }

    // Verificar si ya es miembro
    const existingMember = await this.prisma.collectionMember.findFirst({
      where: {
        collectionId,
        userId: user.id,
      },
    });

    if (existingMember) {
      throw new BadRequestException('User is already a member');
    }

    // Crear invitación
    return this.prisma.collectionMember.create({
      data: {
        collectionId,
        userId: user.id,
        addedBy: ownerId,
        invitedAt: new Date(),
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
  }

  async accept(collectionId: string, userId: string) {
    // Buscar invitación pendiente
    const member = await this.prisma.collectionMember.findFirst({
      where: {
        collectionId,
        userId,
        acceptedAt: null,
      },
    });

    if (!member) {
      throw new NotFoundException('Invitation not found or already accepted');
    }

    // Aceptar invitación
    return this.prisma.collectionMember.update({
      where: { id: member.id },
      data: {
        acceptedAt: new Date(),
      },
    });
  }

  async remove(collectionId: string, ownerId: string, memberId: string) {
    // Verificar que el usuario es el owner
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    if (collection.ownerId !== ownerId) {
      throw new ForbiddenException('Only owner can remove members');
    }

    // Eliminar miembro
    const result = await this.prisma.collectionMember.deleteMany({
      where: {
        collectionId,
        userId: memberId,
      },
    });

    if (result.count === 0) {
      throw new NotFoundException('Member not found in this collection');
    }
  }

  async listMembers(collectionId: string, userId: string) {
    // Verificar acceso (owner o miembro)
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

    // Listar todos los miembros
    return this.prisma.collectionMember.findMany({
      where: { collectionId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: {
        invitedAt: 'desc',
      },
    });
  }
}
