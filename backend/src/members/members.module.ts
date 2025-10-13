import { Module } from '@nestjs/common';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CollectionsModule } from '../collections/collections.module';
import { InvitationsModule } from '../invitations/invitations.module';

@Module({
  imports: [PrismaModule, CollectionsModule, InvitationsModule],
  controllers: [MembersController],
  providers: [MembersService],
})
export class MembersModule {}
