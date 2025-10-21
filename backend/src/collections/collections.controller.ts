import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Request,
  HttpCode,
  HttpStatus,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CollectionsService } from './collections.service';
import { CreateCollectionDto, UpdateCollectionDto, GetPublicCollectionsDto } from './dto';
import { CollectionStatus } from '@prisma/client';
import { PublicCollectionsResponse } from '../types';
import { Public } from '../auth/decorators/public.decorator';
import { AuthenticatedRequest } from '../auth/types';

@ApiTags('collections')
@ApiBearerAuth()
@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Public()
  @Get('public')
  @ApiOperation({
    summary: 'Listar colectas públicas',
    description: 'Obtiene colectas públicas con filtros para la página Explore. No requiere autenticación.',
  })
  async findPublic(@Query() filters: GetPublicCollectionsDto): Promise<PublicCollectionsResponse> {
    return await this.collectionsService.findPublicCollections(filters);
  }

  @Post()
  @ApiOperation({ summary: 'Crear colecta' })
  async create(@Request() req: AuthenticatedRequest, @Body() dto: CreateCollectionDto) {
    // DEBUG: Log para verificar req.user
    console.log('🔍 [CollectionsController.create] req.user:', req.user);
    console.log('🔍 [CollectionsController.create] req.user.id:', req.user.id);
    if (!req.user.id) {
      throw new BadRequestException('User ID is required');
    }
    return this.collectionsService.create(req.user.id, dto);
  }

  @Get('my')
  async findUserCollections(@Request() req: AuthenticatedRequest) {
    return this.collectionsService.findUserCollections(req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar colectas del usuario (dashboard)' })
  async list(@Query() filters: { search?: string; status?: string }, @Request() req: AuthenticatedRequest) {
    // Map status to CollectionStatus if provided
    const serviceFilters: { search?: string; status?: CollectionStatus | undefined } = {};
    if (filters.search) serviceFilters.search = filters.search;
    if (filters.status) serviceFilters.status = filters.status as CollectionStatus;

    return this.collectionsService.findUserCollections(req.user.id, serviceFilters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ver detalle de colecta' })
  async findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.collectionsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar colecta' })
  async update(@Param('id') id: string, @Request() req: AuthenticatedRequest, @Body() dto: UpdateCollectionDto) {
    return this.collectionsService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar colecta' })
  async delete(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    await this.collectionsService.delete(id, req.user.id);
  }

  @Post(':id/members/join')
  @ApiOperation({ summary: 'Unirse a colección pública' })
  async joinCollection(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.collectionsService.joinCollection(id, req.user.id);
  }

  @Post(':id/members/leave')
  @ApiOperation({ summary: 'Salirse de la colección' })
  async leaveCollection(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    await this.collectionsService.leaveCollection(id, req.user.id);
    return { message: 'Left collection successfully' };
  }
}
