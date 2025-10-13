import { Controller, Get, Post, Body, Param, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ContributionsService } from './contributions.service';
import { CreateContributionDto } from './dto';

interface AuthenticatedRequest {
  user: {
    sub: string;
    email: string;
    roles: string[];
  };
}

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
    return this.contributionsService.contribute(collectionId, req.user.sub, dto.amount);
  }

  @Get('collections/:collectionId/contributions')
  @ApiOperation({ summary: 'Listar contribuciones de una colecta' })
  async list(@Param('collectionId') collectionId: string, @Request() req: AuthenticatedRequest) {
    return this.contributionsService.listContributions(collectionId, req.user.sub);
  }

  @Get('contributions')
  @ApiOperation({ summary: 'Obtener mis contribuciones globales' })
  async getMyContributions(@Request() req: AuthenticatedRequest) {
    return this.contributionsService.getMyContributions(req.user.sub);
  }
}
