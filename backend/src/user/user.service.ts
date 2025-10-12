import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '../types';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUserById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        roles: true,
        createdAt: true,
      },
    });

    if (!user) return null;

    // Mapear tipos de Prisma a nuestros types
    return {
      id: user.id,
      email: user.email,
      name: user.name ?? undefined,
      avatar: user.avatar ?? undefined,
      roles: user.roles,
      createdAt: user.createdAt,
    };
  }
}
