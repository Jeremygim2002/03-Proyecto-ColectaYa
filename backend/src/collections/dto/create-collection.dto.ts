import { IsString, IsNumber, IsEnum, IsBoolean, IsOptional, Min, IsUrl, IsDateString } from 'class-validator';
import { RuleType } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCollectionDto {
  @ApiProperty({ example: 'Viaje a Europa', description: 'Nombre de la colecta' })
  @IsString()
  title!: string;

  @ApiPropertyOptional({ example: 'Colecta para financiar viaje grupal', description: 'Descripción opcional' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-123', description: 'URL de imagen de la colecta' })
  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ example: 5000, description: 'Meta de dinero a recaudar' })
  @IsNumber()
  @Min(0)
  goalAmount!: number;

  @ApiProperty({ enum: RuleType, example: 'THRESHOLD', description: 'Tipo de regla para retiros' })
  @IsEnum(RuleType)
  ruleType!: RuleType;

  @ApiPropertyOptional({ example: 50, description: 'Valor de la regla (ej: 50% para THRESHOLD)' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  ruleValue?: number;

  @ApiPropertyOptional({ example: false, description: 'Si la colecta es privada (requiere invitación)' })
  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;

  @ApiPropertyOptional({ example: '2025-12-31T23:59:59Z', description: 'Fecha límite de la colecta' })
  @IsDateString()
  @IsOptional()
  deadlineAt?: string;
}
