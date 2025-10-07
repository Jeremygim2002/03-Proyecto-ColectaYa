import { Controller, Get, Post, Body, Param, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FundingService } from './funding.service';
import { CreateContributionDto } from './dto';

interface AuthenticatedRequest {
  user: {
    sub: string;
    email: string;
    roles: string[];
  };
}

@ApiTags('funding')
@ApiBearerAuth()
@Controller('collections/:collectionId/contributions')
export class FundingController {
  constructor(private readonly fundingService: FundingService) {}

  @Post()
  @ApiOperation({ summary: 'Contribuir a colecta' })
  async contribute(
    @Param('collectionId') collectionId: string,
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreateContributionDto,
  ) {
    return this.fundingService.contribute(collectionId, req.user.sub, dto.amount);
  }

  @Get()
  @ApiOperation({ summary: 'Listar contribuciones' })
  async list(@Param('collectionId') collectionId: string, @Request() req: AuthenticatedRequest) {
    return this.fundingService.listContributions(collectionId, req.user.sub);
  }
}
