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
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CollectionsService } from './collections.service';
import { CreateCollectionDto, UpdateCollectionDto, GetPublicCollectionsDto } from './dto';
import { PublicCollectionsResponse } from '../types';
import { Public, OptionalAuth } from '../auth/decorators';
import { AuthenticatedRequest } from '../auth/types';

@ApiTags('collections')
@ApiBearerAuth()
@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Public()
  @Get('public')
  @ApiOperation({ summary: 'Obtener colectas públicas' })
  async findPublic(@Query() filters: GetPublicCollectionsDto): Promise<PublicCollectionsResponse> {
    return await this.collectionsService.findPublicCollections(filters);
  }

  @Post()
  @ApiOperation({ summary: 'Crear nueva colecta' })
  async create(@Request() req: AuthenticatedRequest, @Body() dto: CreateCollectionDto) {
    if (!req.user?.id) {
      throw new BadRequestException('User ID is required');
    }
    return this.collectionsService.create(req.user.id, dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Obtener mis colectas (propias y participando)' })
  async findUserCollections(@Request() req: AuthenticatedRequest) {
    return this.collectionsService.findUserCollections(req.user!.id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar colectas del usuario con filtros' })
  async list(@Query() filters: { search?: string; status?: string }, @Request() req: AuthenticatedRequest) {
    return this.collectionsService.findUserCollections(req.user!.id, filters);
  }

  @OptionalAuth()
  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalles de una colecta' })
  async findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    // Si hay usuario autenticado, usar su ID, sino undefined
    const userId = req.user?.id;
    // Usar findOneForPreview que permite ver cualquier colecta vía link compartido
    return this.collectionsService.findOneForPreview(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar colecta' })
  async update(@Param('id') id: string, @Request() req: AuthenticatedRequest, @Body() dto: UpdateCollectionDto) {
    return this.collectionsService.update(id, req.user!.id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar colecta' })
  async delete(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    await this.collectionsService.delete(id, req.user!.id);
  }

  @Post(':id/members/join')
  @ApiOperation({ summary: 'Unirse a una colecta pública' })
  async joinCollection(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.collectionsService.joinCollection(id, req.user!.id, false);
  }

  @Post(':id/members/join-via-link')
  @ApiOperation({ summary: 'Unirse a una colecta mediante link compartido' })
  async joinViaSharedLink(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.collectionsService.joinCollection(id, req.user!.id, true);
  }

  @Post(':id/members/leave')
  @ApiOperation({ summary: 'Salir de una colecta' })
  async leaveCollection(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    await this.collectionsService.leaveCollection(id, req.user!.id);
    return { message: 'Left collection successfully' };
  }
}
