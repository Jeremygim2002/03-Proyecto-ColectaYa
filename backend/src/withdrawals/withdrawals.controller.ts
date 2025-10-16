import { Controller, Get, Post, Param, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WithdrawalsService } from './withdrawals.service';

interface AuthenticatedRequest {
  user: {
    sub: string;
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
  @ApiOperation({ summary: 'Retiro inteligente de fondos' })
  async intelligentWithdraw(@Param('collectionId') collectionId: string, @Request() req: AuthenticatedRequest) {
    const result = await this.withdrawalsService.intelligentWithdraw(collectionId, req.user.sub);
    return {
      message: 'Processed successfully',
      action: result.action,
      amount: result.amount,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Listar retiros' })
  async list(@Param('collectionId') collectionId: string, @Request() req: AuthenticatedRequest) {
    return this.withdrawalsService.listWithdrawals(collectionId, req.user.sub);
  }
}
