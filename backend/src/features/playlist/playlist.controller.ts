import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { PlaylistService } from './playlist.service';
import { TotemService } from '../totem/totem.service';
import { TotemTokenGuard } from '../../core/guards/totem-token.guard';
import { TotemCommandService } from '../totem/totem-command.service';

interface TotemAuthenticatedRequest extends Request {
  totemId: number;
}

@ApiTags('playlist')
@Controller('totems')
@UseGuards(TotemTokenGuard)
export class PlaylistController {
  constructor(
    private readonly playlistService: PlaylistService,
    private readonly totemService: TotemService,
    private readonly totemCommandService: TotemCommandService,
  ) {}

  @Get('playlist')
  @ApiOperation({
    summary: 'Retorna a playlist resolvida para o totem autenticado',
  })
  @ApiResponse({ status: 200, description: 'Playlist resolvida' })
  @ApiResponse({ status: 404, description: 'Totem não encontrado' })
  getPlaylist(@Req() request: TotemAuthenticatedRequest) {
    return this.playlistService.resolve(request.totemId);
  }

  @Post('heartbeat')
  @ApiOperation({
    summary: 'Heartbeat do totem: atualiza status e retorna comandos pendentes',
  })
  @ApiResponse({
    status: 200,
    description: 'Status atualizado, comandos retornados',
  })
  @ApiResponse({ status: 404, description: 'Totem não encontrado' })
  async heartbeat(@Req() request: TotemAuthenticatedRequest) {
    await this.totemService.heartbeat(request.totemId);
    const commands = this.totemCommandService.drain(request.totemId);
    return { commands };
  }
}
