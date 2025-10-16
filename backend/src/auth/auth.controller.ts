import { Body, Controller, Post, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignInDto, RegisterDto } from './dto';
import { AuthenticatedRequest } from './types';
import { Public } from './decorators';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Registrar usuario' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto.email, registerDto.password, registerDto.name);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión' })
  async signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cerrar sesión' })
  async logout(@Request() req: AuthenticatedRequest) {
    await this.authService.logout(req.user.sub);
    return { message: 'Cerrado exitosamente' };
  }

  @Post('refresh')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Renovar token de acceso' })
  async refresh(@Request() req: AuthenticatedRequest) {
    return this.authService.refresh(req.user.sub);
  }
}
