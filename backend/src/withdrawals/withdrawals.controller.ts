import { Controller, Get, Post, Param, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WithdrawalsService } from './withdrawals.service';

interface AuthenticatedRequest {
  user: {
    id: string;
    email: string;
    roles: string[];
  };
}

@ApiTags('withdrawals')
@ApiBearerAuth()
@Controller('collections/:collectionId/withdrawals')
export class WithdrawalsController {
  constructor(private readonly withdrawalsService: WithdrawalsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear retiro total de fondos' })
  async create(@Param('collectionId') collectionId: string, @Request() req: AuthenticatedRequest) {
    return this.withdrawalsService.createWithdrawal(collectionId, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar retiros' })
  async list(@Param('collectionId') collectionId: string, @Request() req: AuthenticatedRequest) {
    return this.withdrawalsService.listWithdrawals(collectionId, req.user.id);
  }
}
