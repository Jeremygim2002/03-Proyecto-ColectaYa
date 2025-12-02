import { IsOptional, IsString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum PublicCollectionFilter {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  TODOS = 'TODOS',
}

export class GetPublicCollectionsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(PublicCollectionFilter)
  status?: PublicCollectionFilter;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

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
