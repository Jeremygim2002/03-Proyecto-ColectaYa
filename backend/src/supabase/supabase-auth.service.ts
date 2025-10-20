import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SupabaseAuthService {
  private supabase: SupabaseClient;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('SUPABASE_URL y SUPABASE_ANON_KEY deben estar configurados en .env');
    }

    // Tipado explícito
    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: false,
        detectSessionInUrl: false,
      },
    }) as SupabaseClient;
  }

  //  REFRESH TOKEN
  async refreshToken(refreshToken: string) {
    const { data, error } = await this.supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresIn: data.session.expires_in ?? 3600,
      expiresAt: data.session.expires_at ?? 0,
    };
  }

  //  MAGIC LINK LOGIN
  async sendMagicLink(email: string) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:5173';

    const { error } = await this.supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${frontendUrl}/auth/callback`,
      },
    });

    if (error) {
      throw new BadRequestException(this.formatSupabaseError(error.message));
    }

    return {
      message: 'Magic link enviado a tu email. Haz clic en el enlace para ingresar sin contraseña.',
    };
  }

  //  LOGOUT
  async signOut() {
    await this.supabase.auth.signOut();
    return { message: 'Sesión cerrada exitosamente' };
  }

  //  GOOGLE LOGIN
  async getGoogleLoginUrl() {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:5173';

    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${frontendUrl}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      throw new BadRequestException('Error al iniciar login con Google');
    }

    return { url: data.url };
  }

  //  FACEBOOK LOGIN
  async getFacebookLoginUrl() {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:5173';

    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: `${frontendUrl}/auth/callback`,
      },
    });

    if (error) {
      throw new BadRequestException('Error al iniciar login con Facebook');
    }

    return { url: data.url };
  }

  //  VALIDAR TOKEN JWT
  async validateToken(token: string) {
    const { data, error } = await this.supabase.auth.getUser(token);

    if (error || !data.user) {
      throw new UnauthorizedException('Token inválido');
    }

    return data.user;
  }

  //  GET USER INFO
  async getUserInfo(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        roles: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return user;
  }

  // Sincronizar usuario
  async syncUser(supabaseUser: { id: string; email?: string; user_metadata?: Record<string, unknown> }) {
    return this.syncUserWithPrisma(supabaseUser);
  }

  // MÉTODOS PRIVADOS
  private async syncUserWithPrisma(supabaseUser: {
    id: string;
    email?: string;
    user_metadata?: Record<string, unknown>;
  }) {
    try {
      await this.prisma.user.upsert({
        where: { id: supabaseUser.id },
        create: {
          id: supabaseUser.id,
          email: supabaseUser.email ?? '',
          name: (supabaseUser.user_metadata?.['name'] as string) ?? null,
          avatar: (supabaseUser.user_metadata?.['avatar_url'] as string) ?? null,
          password: '',
        },
        update: {
          email: supabaseUser.email ?? undefined,
          name: (supabaseUser.user_metadata?.['name'] as string) ?? null,
          avatar: (supabaseUser.user_metadata?.['avatar_url'] as string) ?? null,
        },
      });
    } catch (error) {
      console.error('Error syncing user with Prisma:', error);
      throw new BadRequestException('Error al sincronizar usuario con la base de datos');
    }
  }

  private async updateLastLogin(userId: string) {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          // lastLoginAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  }

  // Errores de supabase mejor formateados
  private formatSupabaseError(errorMessage: string): string {
    const errorMap: Record<string, string> = {
      'User already registered': 'Este email ya está registrado',
      'Invalid login credentials': 'Credenciales inválidas',
      'Email not confirmed': 'Debes confirmar tu email antes de iniciar sesión',
      'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres',
      'Unable to validate email address: invalid format': 'El formato del email es inválido',
      'Email address is invalid': 'El email proporcionado no es válido. Usa un email real (ej: usuario@gmail.com)',
    };

    for (const [key, value] of Object.entries(errorMap)) {
      if (errorMessage.includes(key)) {
        return value;
      }
    }

    return errorMessage;
  }
}
