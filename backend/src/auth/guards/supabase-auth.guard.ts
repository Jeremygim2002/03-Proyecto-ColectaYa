import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { SupabaseAuthService } from '../../supabase/supabase-auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { IS_PUBLIC_KEY, IS_OPTIONAL_AUTH_KEY } from '../decorators';
import { AuthenticatedRequest } from '../types';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(
    private authService: SupabaseAuthService,
    private prisma: PrismaService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. VERIFICAR SI ES RUTA PÚBLICA
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // 2. VERIFICAR SI ES RUTA CON AUTH OPCIONAL
    const isOptionalAuth = this.reflector.getAllAndOverride<boolean>(IS_OPTIONAL_AUTH_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 3. EXTRAER TOKEN DEL HEADER
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      // Si no hay token y auth es opcional, permitir acceso sin usuario
      if (isOptionalAuth) {
        request.user = undefined;
        return true;
      }
      throw new UnauthorizedException('Token no proporcionado');
    }

    try {
      // 3. VALIDAR TOKEN CON SUPABASE
      const supabaseUser = await this.authService.validateToken(token);

      // 4. OBTENER DATOS COMPLETOS DE PRISMA
      const prismaUser = await this.prisma.user.findUnique({
        where: { id: supabaseUser.id },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          roles: true,
          createdAt: true,
        },
      });

      if (!prismaUser) {
        throw new UnauthorizedException('Usuario no encontrado en la base de datos');
      }

      // 5. AGREGAR USUARIO A LA REQUEST
      request.user = {
        id: prismaUser.id,
        email: prismaUser.email,
        roles: prismaUser.roles,
        name: prismaUser.name,
        avatar: prismaUser.avatar,
      };

      return true;
    } catch (error) {
      console.error('Error en SupabaseAuthGuard:', error);
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
