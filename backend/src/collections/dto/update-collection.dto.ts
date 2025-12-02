import { IsString, IsNumber, IsEnum, IsBoolean, IsOptional, Min, IsUrl, IsDateString } from 'class-validator';
import { RuleType, CollectionStatus } from '@prisma/client';

export class UpdateCollectionDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUrl()
  @IsOptional()
  imageUrl?: string;

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

  @IsEnum(CollectionStatus)
  @IsOptional()
  status?: CollectionStatus;

  @IsDateString()
  @IsOptional()
  deadlineAt?: string;
}
