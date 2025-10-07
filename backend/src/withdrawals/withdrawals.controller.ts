import { Controller, Get, Post, Body, Param, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WithdrawalsService } from './withdrawals.service';
import { RequestWithdrawalDto } from './dto';

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
  @ApiOperation({ summary: 'Solicitar retiro de fondos' })
  async request(
    @Param('collectionId') collectionId: string,
    @Request() req: AuthenticatedRequest,
    @Body() dto: RequestWithdrawalDto,
  ) {
    return this.withdrawalsService.requestWithdrawal(collectionId, req.user.sub, dto.amount);
  }

  @Get()
  @ApiOperation({ summary: 'Listar retiros' })
  async list(@Param('collectionId') collectionId: string, @Request() req: AuthenticatedRequest) {
    return this.withdrawalsService.listWithdrawals(collectionId, req.user.sub);
  }
}
