import { IsNumber, Min } from 'class-validator';

export class CreateContributionDto {
  @IsNumber()
  @Min(0.01)
  amount!: number;
}
