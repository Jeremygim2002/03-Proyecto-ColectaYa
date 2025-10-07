import { IsNumber, Min } from 'class-validator';

export class RequestWithdrawalDto {
  @IsNumber()
  @Min(0.01)
  amount!: number;
}
