import { IsString, IsNumber, IsEnum, IsBoolean, IsOptional, Min, IsUrl, IsDateString } from 'class-validator';
import { RuleType } from '@prisma/client';

export class CreateCollectionDto {
  @IsString()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUrl()
  @IsOptional()
  imageUrl?: string;

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

  @IsDateString()
  @IsOptional()
  deadlineAt?: string;
}
