import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CollectionsModule } from './collections/collections.module';
import { MembersModule } from './members/members.module';
import { ContributionsModule } from './contributions/contributions.module';
import { InvitationsModule } from './invitations/invitations.module';
import { WithdrawalsModule } from './withdrawals/withdrawals.module';
import configuration from './config/configuration';
import { validationSchema } from './config/validation';
import { SupabaseModule } from './supabase/supabase.module';
import { PrismaModule } from './prisma/prisma.module';
import { SupabaseAuthGuard, RolesGuard } from './auth/guards';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // ConfigService disponible globalmente
      envFilePath: '.env',
      load: [configuration], // Carga configuración personalizada
      validationSchema, // Validación con Joi
      cache: true, // Mejora performance del ConfigService#get
      validationOptions: {
        allowUnknown: true, // Permitir variables del sistema
        abortEarly: true, // Detener en el primer error
      },
    }),

    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.THROTTLE_TTL ?? '60000', 10),
        limit: parseInt(process.env.THROTTLE_LIMIT ?? '20', 10),
      },
    ]),
    AuthModule,
    PrismaModule,
    SupabaseModule,
    CollectionsModule,
    MembersModule,
    ContributionsModule,
    InvitationsModule,
    WithdrawalsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: SupabaseAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard, // Autorización por roles
    },
  ],
})
export class AppModule {}
