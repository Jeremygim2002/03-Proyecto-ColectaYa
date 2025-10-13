import { Controller, Get, Post, Delete, Body, Param, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MembersService } from './members.service';
import { InviteMemberDto } from './dto';
import { InvitationsService } from '../invitations/invitations.service';

interface AuthenticatedRequest {
  user: {
    sub: string;
    email: string;
    roles: string[];
  };
}

@ApiTags('members')
@ApiBearerAuth()
@Controller('collections/:collectionId/members')
export class MembersController {
  constructor(
    private readonly membersService: MembersService,
    private readonly invitationsService: InvitationsService,
  ) {}

  @Post('invite')
  @ApiOperation({ summary: 'Invitar miembro (crea invitación pendiente)' })
  async invite(
    @Param('collectionId') collectionId: string,
    @Request() req: AuthenticatedRequest,
    @Body() dto: InviteMemberDto,
  ) {
    return this.invitationsService.createInvitation(collectionId, req.user.sub, dto.email);
  }

  @Delete(':userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover miembro' })
  async remove(
    @Param('collectionId') collectionId: string,
    @Param('userId') userId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    await this.membersService.remove(collectionId, req.user.sub, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar miembros' })
  async list(@Param('collectionId') collectionId: string, @Request() req: AuthenticatedRequest) {
    return this.membersService.listMembers(collectionId, req.user.sub);
  }
}
