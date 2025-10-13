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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CollectionsService } from './collections.service';
import { CreateCollectionDto, UpdateCollectionDto, GetPublicCollectionsDto } from './dto';
import { PublicCollectionsResponse } from '../types';
import { Public } from '../auth/decorators/public.decorator';

interface AuthenticatedRequest {
  user: {
    sub: string;
    email: string;
    roles: string[];
  };
}

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
    return this.collectionsService.create(req.user.sub, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar mis colectas' })
  async findMine(@Request() req: AuthenticatedRequest) {
    return this.collectionsService.findUserCollections(req.user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ver detalle de colecta' })
  async findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.collectionsService.findOne(id, req.user.sub);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar colecta' })
  async update(@Param('id') id: string, @Request() req: AuthenticatedRequest, @Body() dto: UpdateCollectionDto) {
    return this.collectionsService.update(id, req.user.sub, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar colecta' })
  async delete(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    await this.collectionsService.delete(id, req.user.sub);
  }

  @Post(':id/members/join')
  @ApiOperation({ summary: 'Unirse a colección pública' })
  async joinCollection(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.collectionsService.joinCollection(id, req.user.sub);
  }
}
