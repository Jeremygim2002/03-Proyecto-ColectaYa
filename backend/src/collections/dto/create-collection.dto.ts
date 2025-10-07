import { IsString, IsNumber, IsEnum, IsBoolean, IsOptional, Min } from 'class-validator';
import { RuleType } from '@prisma/client';

export class CreateCollectionDto {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  goalAmount!: number;

  @IsEnum(RuleType)
  ruleType!: RuleType;

  @IsNumber()
  @Min(0)
  @IsOptional()
  ruleValue?: number;

  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;
}
