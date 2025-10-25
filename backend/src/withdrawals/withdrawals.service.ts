import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WithdrawalsService {
  constructor(private prisma: PrismaService) {}

  async intelligentWithdraw(collectionId: string, userId: string) {
    const collection = await this.prisma.collection.findFirst({
      where: {
        id: collectionId,
        ownerId: userId,
      },
      include: {
        contributions: {
          where: { status: 'PAID' },
        },
      },
    });

    if (!collection) {
      throw new NotFoundException('Collection not found or you are not the owner');
    }

    const totalAmount = collection.contributions.reduce((sum, contrib) => sum + Number(contrib.amount), 0);
    const goalAmount = Number(collection.goalAmount);

    if (totalAmount >= goalAmount) {
      return {
        action: 'TRANSFERRED' as const,
        amount: totalAmount,
      };
    } else {
      return {
        action: 'REFUNDED' as const,
        amount: totalAmount,
      };
    }
  }

  async listWithdrawals(collectionId: string, userId: string) {
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    if (collection.ownerId !== userId) {
      throw new ForbiddenException('Only owner can view withdrawals');
    }

    return this.prisma.withdrawal.findMany({
      where: { collectionId },
      include: {
        requester: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
