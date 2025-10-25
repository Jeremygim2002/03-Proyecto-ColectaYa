import { Controller, Get, Post, Body, Param, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ContributionsService } from './contributions.service';
import { CreateContributionDto } from './dto';
import { AuthenticatedRequest } from '../auth/types';

@ApiTags('contributions')
@ApiBearerAuth()
@Controller()
export class ContributionsController {
  constructor(private readonly contributionsService: ContributionsService) {}

  @Post('collections/:collectionId/contributions')
  @ApiOperation({ summary: 'Contribuir a colecta' })
  async contribute(
    @Param('collectionId') collectionId: string,
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreateContributionDto,
  ) {
    const contribution = await this.contributionsService.contribute(collectionId, req.user.id, dto.amount);
    
    // Mapear datos de Prisma al formato esperado por el frontend
    return {
      id: contribution.id,
      collectionId: contribution.collectionId,
      userId: contribution.userId,
      userName: contribution.user?.name || 'Usuario Anónimo',
      userAvatar: null, // El campo avatar no existe en User
      amount: Number(contribution.amount),
      message: null, // El campo message no existe en Contribution
      isAnonymous: false, // El campo isAnonymous no existe en Contribution
      createdAt: contribution.createdAt.toISOString(),
    };
  }

  @Get('collections/:collectionId/contributions')
  @ApiOperation({ summary: 'Listar contribuciones de una colecta' })
  async list(@Param('collectionId') collectionId: string, @Request() req: AuthenticatedRequest) {
    const contributions = await this.contributionsService.listContributions(collectionId, req.user.id);
    
    // Mapear datos de Prisma al formato esperado por el frontend
    return contributions.map((contribution) => ({
      id: contribution.id,
      collectionId: contribution.collectionId,
      userId: contribution.userId,
      userName: contribution.user?.name || 'Usuario Anónimo',
      userAvatar: null, // El campo avatar no existe en User
      amount: Number(contribution.amount),
      message: null, // El campo message no existe en Contribution
      isAnonymous: false, // El campo isAnonymous no existe en Contribution
      createdAt: contribution.createdAt.toISOString(),
    }));
  }

  @Get('contributions')
  @ApiOperation({ summary: 'Obtener mis contribuciones globales' })
  async getMyContributions(@Request() req: AuthenticatedRequest) {
    return this.contributionsService.getMyContributions(req.user.id);
  }
}