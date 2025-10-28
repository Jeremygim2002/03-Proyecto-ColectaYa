import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { SupabaseModule } from '../supabase/supabase.module';
import { SupabaseAuthGuard } from './guards';

@Module({
  imports: [ConfigModule, PrismaModule, SupabaseModule],
  controllers: [AuthController],
  providers: [
    SupabaseAuthGuard, // Registrar el guard
  ],
  exports: [SupabaseAuthGuard],
})
export class AuthModule {}
