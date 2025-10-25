import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InvitationStatus } from '@prisma/client';
import { InvitationResponseDto } from './dto';

@Injectable()
export class InvitationsService {
  constructor(private readonly prisma: PrismaService) {}

  async createInvitation(collectionId: string, inviterId: string, invitedEmail: string) {
    // Verificar que la colección existe y el inviter tiene permisos
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
      include: {
        members: true,
      },
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    // Verificar que el inviter es owner o miembro
    const isOwner = collection.ownerId === inviterId;
    const isMember = collection.members.some((member) => member.userId === inviterId);

    if (!isOwner && !isMember) {
      throw new ForbiddenException('Only collection owner or members can invite others');
    }

    // Buscar el usuario a invitar por email
    const invitedUser = await this.prisma.user.findUnique({
      where: { email: invitedEmail },
    });

    if (!invitedUser) {
      throw new NotFoundException('User with this email not found');
    }

    // Verificar que no sea ya miembro
    const isAlreadyMember = collection.members.some((member) => member.userId === invitedUser.id);
    if (isAlreadyMember) {
      throw new BadRequestException('User is already a member of this collection');
    }

    // Verificar que no tenga una invitación pendiente
    const existingInvitation = await this.prisma.invitation.findUnique({
      where: {
        collectionId_invitedId: {
          collectionId,
          invitedId: invitedUser.id,
        },
      },
    });

    if (existingInvitation) {
      throw new BadRequestException('User already has a pending invitation for this collection');
    }

    // Crear la invitación
    const invitation = await this.prisma.invitation.create({
      data: {
        collectionId,
        inviterId,
        invitedId: invitedUser.id,
        status: InvitationStatus.PENDING, // Por defecto, pendiente de aceptar
      },
      include: {
        collection: {
          select: {
            id: true,
            title: true,
            description: true,
            imageUrl: true,
          },
        },
        inviter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return {
      id: invitation.id,
      status: invitation.status,
      createdAt: invitation.createdAt,
      respondedAt: invitation.respondedAt,
      collection: invitation.collection,
      inviter: invitation.inviter,
    };
  }

  async getMyInvitations(userId: string): Promise<InvitationResponseDto[]> {
    const invitations = await this.prisma.invitation.findMany({
      where: {
        invitedId: userId,
      },
      include: {
        collection: {
          select: {
            id: true,
            title: true,
            description: true,
            imageUrl: true,
          },
        },
        inviter: {
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

    return invitations.map((invitation) => ({
      id: invitation.id,
      status: invitation.status,
      createdAt: invitation.createdAt,
      respondedAt: invitation.respondedAt,
      collection: invitation.collection,
      inviter: invitation.inviter,
    }));
  }

  async acceptInvitation(invitationId: string, userId: string) {
    // Buscar la invitación
    const invitation = await this.prisma.invitation.findUnique({
      where: { id: invitationId },
      include: {
        collection: true,
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.invitedId !== userId) {
      throw new ForbiddenException('You can only accept your own invitations');
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException('Invitation is not in a pending state');
    }

    // Verificar que no sea ya miembro
    const existingMember = await this.prisma.collectionMember.findUnique({
      where: {
        collectionId_userId: {
          collectionId: invitation.collectionId,
          userId,
        },
      },
    });

    if (existingMember) {
      throw new BadRequestException('User is already a member of this collection');
    }

    // Usar transacción para agregar miembro y eliminar invitación
    const result = await this.prisma.$transaction(async (prisma) => {
      // Agregar como miembro
      const member = await prisma.collectionMember.create({
        data: {
          collectionId: invitation.collectionId,
          userId,
          invitedAt: invitation.createdAt,
          acceptedAt: new Date(),
          addedBy: invitation.inviterId,
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
        },
      });

      // Eliminar la invitación después de aceptarla
      await prisma.invitation.delete({
        where: { id: invitationId },
      });

      return member;
    });

    return {
      message: 'Invitation accepted successfully',
      member: {
        id: result.id,
        userId: result.userId,
        collectionId: result.collectionId,
        acceptedAt: result.acceptedAt,
        user: result.user,
      },
    };
  }

  async rejectInvitation(invitationId: string, userId: string) {
    // Buscar la invitación
    const invitation = await this.prisma.invitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.invitedId !== userId) {
      throw new ForbiddenException('You can only reject your own invitations');
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException('Invitation is not in a pending state');
    }

    // Eliminar la invitación directamente
    await this.prisma.invitation.delete({
      where: { id: invitationId },
    });

    return { message: 'Invitation rejected successfully' };
  }

  async cancelInvitation(invitationId: string, userId: string) {
    // Buscar la invitación
    const invitation = await this.prisma.invitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.inviterId !== userId) {
      throw new ForbiddenException('You can only cancel invitations you sent');
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException('Invitation has already been responded to');
    }

    // Eliminar la invitación
    await this.prisma.invitation.delete({
      where: { id: invitationId },
    });

    return { message: 'Invitation cancelled successfully' };
  }
}
