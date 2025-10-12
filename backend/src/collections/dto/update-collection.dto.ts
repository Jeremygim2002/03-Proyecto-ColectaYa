import { IsString, IsNumber, IsEnum, IsBoolean, IsOptional, Min, IsUrl, IsDateString } from 'class-validator';
import { RuleType, CollectionStatus } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCollectionDto {
  @ApiPropertyOptional({ example: 'Viaje a Europa 2025', description: 'Nuevo nombre de la colecta' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 'Descripción actualizada', description: 'Nueva descripción' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-456', description: 'Nueva URL de imagen' })
  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({ example: 6000, description: 'Nueva meta de dinero' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  goalAmount?: number;

  @ApiPropertyOptional({ enum: RuleType, example: 'ANYTIME', description: 'Nuevo tipo de regla' })
  @IsEnum(RuleType)
  @IsOptional()
  ruleType?: RuleType;

  @ApiPropertyOptional({ example: 75, description: 'Nuevo valor de regla' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  ruleValue?: number;

  @ApiPropertyOptional({ example: true, description: 'Cambiar privacidad de la colecta' })
  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;

  @ApiPropertyOptional({ enum: CollectionStatus, example: 'COMPLETED', description: 'Cambiar estado de la colecta' })
  @IsEnum(CollectionStatus)
  @IsOptional()
  status?: CollectionStatus;

  @ApiPropertyOptional({ example: '2026-01-31T23:59:59Z', description: 'Nueva fecha límite' })
  @IsDateString()
  @IsOptional()
  deadlineAt?: string;
}
