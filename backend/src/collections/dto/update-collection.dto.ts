import { IsString, IsNumber, IsEnum, IsBoolean, IsOptional, Min } from 'class-validator';
import { RuleType } from '@prisma/client';

export class UpdateCollectionDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  goalAmount?: number;

  @IsEnum(RuleType)
  @IsOptional()
  ruleType?: RuleType;

  @IsNumber()
  @Min(0)
  @IsOptional()
  ruleValue?: number;

  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;
}
