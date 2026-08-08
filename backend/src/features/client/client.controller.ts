import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ClientService } from './client.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { CurrentUser } from '../../core/decorators/current-user.decorator';

@ApiTags('clients')
@ApiBearerAuth()
@Controller('clients')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo cliente' })
  @ApiResponse({ status: 201, description: 'Cliente criado' })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
  @ApiResponse({ status: 409, description: 'Cliente já cadastrado' })
  create(
    @Body() dto: CreateClientDto,
    @CurrentUser('username') username: string,
  ) {
    return this.clientService.create(dto, username);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os clientes' })
  @ApiResponse({ status: 200, description: 'Lista de clientes' })
  findAll() {
    return this.clientService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um cliente por id' })
  @ApiResponse({ status: 200, description: 'Cliente encontrado' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.clientService.findOne(id);
  }

  @Get(':id/totems')
  @ApiOperation({ summary: 'Lista os totens de um cliente' })
  @ApiResponse({ status: 200, description: 'Lista de totens do cliente' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  findTotems(@Param('id', ParseIntPipe) id: number) {
    return this.clientService.findTotems(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza um cliente' })
  @ApiResponse({ status: 200, description: 'Cliente atualizado' })
  @ApiResponse({
    status: 404,
    description: 'Cliente ou categoria não encontrada',
  })
  @ApiResponse({ status: 409, description: 'Cliente já cadastrado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateClientDto,
    @CurrentUser('username') username: string,
  ) {
    return this.clientService.update(id, dto, username);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove um cliente' })
  @ApiResponse({ status: 204, description: 'Cliente removido' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  @ApiResponse({
    status: 409,
    description: 'Cliente possui totens/media vinculados',
  })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('username') username: string,
  ) {
    return this.clientService.remove(id, username);
  }
}
