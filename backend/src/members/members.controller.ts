import { Controller, Get, Delete, Param, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MembersService } from './members.service';

interface AuthenticatedRequest {
  user: {
    id: string;
    email: string;
    roles: string[];
  };
}

@ApiTags('members')
@ApiBearerAuth()
@Controller('collections/:collectionId/members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Delete(':userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover miembro' })
  async remove(
    @Param('collectionId') collectionId: string,
    @Param('userId') userId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    await this.membersService.remove(collectionId, req.user.id, userId);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Dejar colecta' })
  async leave(@Param('collectionId') collectionId: string, @Request() req: AuthenticatedRequest) {
    await this.membersService.leave(collectionId, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar miembros' })
  async list(@Param('collectionId') collectionId: string, @Request() req: AuthenticatedRequest) {
    const members = await this.membersService.listMembers(collectionId, req.user.id);
    return {
      members,
      total: members.length,
    };
  }
}
