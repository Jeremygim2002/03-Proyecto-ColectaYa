import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { SignInDto } from './dto';
import { AuthResponse } from '../types/user.types';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(email: string, password: string, name?: string): Promise<AuthResponse> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new UnauthorizedException('Este email ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
    };

    const expiresIn = '24h';
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn,
    });

    // Generar refresh token (por ahora usa el mismo secreto, en producción debería ser diferente)
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name ?? undefined,
        avatar: user.avatar ?? undefined,
        roles: user.roles,
        createdAt: user.createdAt,
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: 24 * 60 * 60,
      },
    };
  }

  async signIn(signInDto: SignInDto): Promise<AuthResponse> {
    const { email, password } = signInDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
    };

    const expiresIn = '24h';
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn,
    });

    // Generar refresh token (por ahora usa el mismo secreto, en producción debería ser diferente)
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d', // Refresh token dura más
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name ?? undefined,
        avatar: user.avatar ?? undefined,
        roles: user.roles,
        createdAt: user.createdAt,
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: 24 * 60 * 60,
      },
    };
  }

  async validateUser(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        roles: true,
      },
    });
  }

  async logout(userId: string): Promise<void> {
    // Por ahora simplemente validamos que el usuario existe
    // En una implementación más robusta, agregaríamos el token a una blacklist
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid user');
    }
  }

  async refresh(userId: string): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid user');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
    };

    const expiresIn = '24h';
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 24 * 60 * 60, // 24 horas en segundos
    };
  }
}
