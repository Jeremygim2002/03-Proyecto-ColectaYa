import { Module } from '@nestjs/common';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CollectionsModule } from '../collections/collections.module';

@Module({
  imports: [PrismaModule, CollectionsModule],
  controllers: [MembersController],
  providers: [MembersService],
})
export class MembersModule {}
