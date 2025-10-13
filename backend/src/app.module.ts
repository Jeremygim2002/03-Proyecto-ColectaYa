import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { CollectionsModule } from './collections/collections.module';
import { MembersModule } from './members/members.module';
import { ContributionsModule } from './contributions/contributions.module';
import { InvitationsModule } from './invitations/invitations.module';
import { WithdrawalsModule } from './withdrawals/withdrawals.module';
import { AuthGuard } from './auth/auth.guard';
import configuration from './config/configuration';
import { validationSchema } from './config/validation';

@Module({
  imports: [
    // Configuración completa de variables de entorno con validación
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

    // Rate limiting global
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),
    UserModule,
    AuthModule,
    CollectionsModule,
    MembersModule,
    ContributionsModule,
    InvitationsModule,
    WithdrawalsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // AuthGuard globalmente (debe ir antes que ThrottlerGuard)
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    // ThrottlerGuard globalmente
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
