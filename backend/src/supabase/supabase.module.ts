import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseAuthService } from './supabase-auth.service';
import { PrismaModule } from '../prisma/prisma.module';

@Global()
@Module({
  imports: [ConfigModule, PrismaModule],
  providers: [SupabaseAuthService],
  exports: [SupabaseAuthService],
})
export class SupabaseModule {}
