import { IsOptional, IsString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum PublicCollectionFilter {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  TODOS = 'TODOS',
}

export class GetPublicCollectionsDto {
  @ApiPropertyOptional({ example: 'viaje', description: 'Buscar en título y descripción' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: PublicCollectionFilter,
    example: 'ACTIVE',
    description: 'Filtrar por estado: ACTIVE, COMPLETED, TODOS',
  })
  @IsOptional()
  @IsEnum(PublicCollectionFilter)
  status?: PublicCollectionFilter;

  @ApiPropertyOptional({ example: 1, description: 'Número de página (inicia en 1)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 12, description: 'Cantidad de colectas por página (máximo 50)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 12;

  get skip(): number {
    return ((this.page ?? 1) - 1) * (this.limit ?? 12);
  }

  get take(): number {
    return this.limit ?? 12;
  }
}
