import { Controller, Get, Post, Put, Delete, Body, Param, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InvitationsService } from './invitations.service';
import { CreateInvitationDto } from './dto';

interface AuthenticatedRequest {
  user: {
    sub: string;
    email: string;
    roles: string[];
  };
}

@ApiTags('invitations')
@ApiBearerAuth()
@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener mis invitaciones pendientes' })
  async getMyInvitations(@Request() req: AuthenticatedRequest) {
    return this.invitationsService.getMyInvitations(req.user.sub);
  }

  @Post()
  @ApiOperation({ summary: 'Crear nueva invitación' })
  async createInvitation(@Request() req: AuthenticatedRequest, @Body() createInvitationDto: CreateInvitationDto) {
    return this.invitationsService.createInvitation(
      createInvitationDto.collectionId,
      req.user.sub,
      createInvitationDto.invitedEmail,
    );
  }

  @Put(':id/accept')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Aceptar invitación' })
  async acceptInvitation(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.invitationsService.acceptInvitation(id, req.user.sub);
  }

  @Put(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rechazar invitación' })
  async rejectInvitation(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.invitationsService.rejectInvitation(id, req.user.sub);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancelar invitación enviada' })
  async cancelInvitation(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.invitationsService.cancelInvitation(id, req.user.sub);
  }
}
