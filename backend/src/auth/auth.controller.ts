import { Body, Controller, Post, Get, Request, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { SupabaseAuthService } from '../supabase/supabase-auth.service';
import { RefreshTokenDto, MagicLinkDto } from './dto';
import { AuthenticatedRequest } from './types';
import { Public } from './decorators';
import { SupabaseAuthGuard } from './guards';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private supabaseAuth: SupabaseAuthService) {}

  // LOGOUT
  @Post('logout')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cerrar sesión' })
  async logout() {
    return await this.supabaseAuth.signOut(); // Espera a que se complete
  }

  // REFRESH TOKEN
  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Renovar access token usando refresh token' })
  @ApiBody({ type: RefreshTokenDto })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.supabaseAuth.refreshToken(dto.refreshToken);
  }

  // OBTENER PERFIL DEL USUARIO AUTENTICADO
  @Get('me')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener información del usuario autenticado' })
  async getProfile(@Request() req: AuthenticatedRequest) {
    return this.supabaseAuth.getUserInfo(req.user.id);
  }

  // MAGIC LINK LOGIN
  @Public()
  @Post('magic-link')
  @ApiOperation({ summary: 'Enviar magic link para login sin contraseña' })
  @ApiBody({ type: MagicLinkDto })
  async sendMagicLink(@Body() dto: MagicLinkDto) {
    return this.supabaseAuth.sendMagicLink(dto.email);
  }

  // OAUTH - GOOGLE
  @Public()
  @Get('google')
  @ApiOperation({ summary: 'Obtener URL de login con Google' })
  async googleLogin() {
    return this.supabaseAuth.getGoogleLoginUrl();
  }

  // OAUTH - FACEBOOK
  @Public()
  @Get('facebook')
  @ApiOperation({ summary: 'Obtener URL de login con Facebook' })
  async facebookLogin() {
    return this.supabaseAuth.getFacebookLoginUrl();
  }

  // CALLBACK HANDLER (para Magic Link y OAuth)
  @Public()
  @Post('callback')
  @ApiOperation({ summary: 'Manejar callback de autenticación (Magic Link/OAuth)' })
  async handleCallback(@Body('access_token') accessToken: string, @Body('refresh_token') refreshToken: string) {
    if (!accessToken) {
      throw new BadRequestException('Token de acceso requerido');
    }

    try {
      // 1. Validar el token con Supabase
      const supabaseUser = await this.supabaseAuth.validateToken(accessToken);

      // 2.  SINCRONIZAR CON PRISMA
      await this.supabaseAuth.syncUser(supabaseUser);

      // 3. Obtener datos completos de Prisma (incluye roles)
      const prismaUser = await this.supabaseAuth.getUserInfo(supabaseUser.id);

      return {
        user: {
          id: prismaUser.id,
          email: prismaUser.email,
          name: prismaUser.name,
          avatar: prismaUser.avatar,
          roles: prismaUser.roles,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
        message: 'Autenticación exitosa',
      };
    } catch (error) {
      throw new BadRequestException(
        `Error al procesar callback: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      );
    }
  }
}
