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
import { TotemService } from './totem.service';
import { CreateTotemDto } from './dto/create-totem.dto';
import { UpdateTotemDto } from './dto/update-totem.dto';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { PairTotemDto } from './dto/pair-totem.dto';
import { TotemPairingService } from './totem-pairing.service';
import { CreateCommandDto } from './dto/create-command.dto';
import { TotemCommandService } from './totem-command.service';

@ApiTags('totems')
@ApiBearerAuth()
@Controller('totems')
export class TotemController {
  constructor(
    private readonly totemService: TotemService,
    private readonly totemPairingService: TotemPairingService,
    private readonly totemCommandService: TotemCommandService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo totem' })
  @ApiResponse({ status: 201, description: 'Totem criado' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  @ApiResponse({ status: 409, description: 'Serial já cadastrado' })
  create(
    @Body() dto: CreateTotemDto,
    @CurrentUser('username') username: string,
  ) {
    return this.totemService.create(dto, username);
  }

  @Post('pair')
  @ApiOperation({ summary: 'Pareia o totem físico via código de 6 dígitos' })
  @ApiResponse({ status: 201, description: 'Totem pareado, token retornado' })
  @ApiResponse({ status: 404, description: 'Código de pareamento inválido' })
  pair(@Body() dto: PairTotemDto) {
    return this.totemPairingService.pair(dto.code, dto.deviceId);
  }

  @Post(':id/pairing-code')
  @ApiOperation({ summary: 'Gera novo código de pareamento para o totem' })
  @ApiResponse({ status: 201, description: 'Código gerado' })
  @ApiResponse({ status: 404, description: 'Totem não encontrado' })
  async generatePairingCode(@Param('id', ParseIntPipe) id: number) {
    await this.totemService.findOne(id);
    const pairingCode = this.totemPairingService.generateCode(id);
    return { pairingCode };
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os totens' })
  @ApiResponse({ status: 200, description: 'Lista de totens' })
  findAll() {
    return this.totemService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um totem por id' })
  @ApiResponse({ status: 200, description: 'Totem encontrado' })
  @ApiResponse({ status: 404, description: 'Totem não encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.totemService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza um totem' })
  @ApiResponse({ status: 200, description: 'Totem atualizado' })
  @ApiResponse({
    status: 404,
    description: 'Totem ou cliente não encontrado',
  })
  @ApiResponse({ status: 409, description: 'Serial já cadastrado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTotemDto,
    @CurrentUser('username') username: string,
  ) {
    return this.totemService.update(id, dto, username);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove um totem' })
  @ApiResponse({ status: 204, description: 'Totem removido' })
  @ApiResponse({ status: 404, description: 'Totem não encontrado' })
  @ApiResponse({
    status: 409,
    description: 'Totem possui credenciais/logs vinculados',
  })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('username') username: string,
  ) {
    return this.totemService.remove(id, username);
  }

  @Post(':id/commands')
  @ApiOperation({ summary: 'Enfileira um comando para o totem' })
  @ApiResponse({ status: 201, description: 'Comando enfileirado' })
  @ApiResponse({ status: 404, description: 'Totem não encontrado' })
  async createCommand(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateCommandDto,
  ) {
    await this.totemService.findOne(id);
    this.totemCommandService.enqueue(id, dto.type);
    return { queued: true };
  }
}
