import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto, GetUsersDto } from './dto';
import { ParseIntPipe } from '../common/pipes';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Obtener todos los usuarios con paginación' })
  @Get()
  async getAllUsers(@Query() query: GetUsersDto) {
    return this.userService.getAllUsers(query);
  }

  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  @Post()
  async createUser(@Body() data: CreateUserDto) {
    return this.userService.createUser(data);
  }

  @ApiOperation({ summary: 'Obtener usuario por ID' })
  @Get(':id')
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    const userFound = await this.userService.getUserById(id);
    if (!userFound) throw new BadRequestException('User not found');
    return userFound;
  }

  @ApiOperation({ summary: 'Eliminar usuario por ID' })
  @Delete(':id')
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.userService.deleteUser({ id });
    } catch {
      throw new NotFoundException('User not found');
    }
  }

  @ApiOperation({ summary: 'Actualizar usuario por ID' })
  @Put(':id')
  async updateUser(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateUserDto) {
    try {
      return this.userService.updateUser({
        where: { id },
        data,
      });
    } catch {
      throw new NotFoundException('User not found');
    }
  }
}
