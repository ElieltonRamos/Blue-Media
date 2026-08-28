import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import express from 'express';
import * as fs from 'fs';
import { MediaService } from './media.service';
import { CreateMediaDto } from './dto/create-media.dto';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { Public } from '../../core/decorators/public.decorator';

@ApiTags('media')
@ApiBearerAuth()
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Cadastra uma nova mídia com upload de vídeo' })
  @ApiResponse({ status: 201, description: 'Mídia criada' })
  @ApiResponse({ status: 400, description: 'Arquivo de vídeo é obrigatório' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  create(
    @Body() dto: CreateMediaDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('username') username: string,
  ) {
    return this.mediaService.create(dto, file, username);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todas as mídias' })
  @ApiResponse({ status: 200, description: 'Lista de mídias' })
  findAll() {
    return this.mediaService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca uma mídia por id' })
  @ApiResponse({ status: 200, description: 'Mídia encontrada' })
  @ApiResponse({ status: 404, description: 'Mídia não encontrada' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.mediaService.findOne(id);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove uma mídia' })
  @ApiResponse({ status: 204, description: 'Mídia removida' })
  @ApiResponse({ status: 404, description: 'Mídia não encontrada' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('username') username: string,
  ) {
    return this.mediaService.remove(id, username);
  }

  @Public()
  @Get(':id/file')
  @ApiOperation({
    summary: 'Faz o download/streaming do arquivo de vídeo da mídia',
  })
  @ApiResponse({ status: 200, description: 'Arquivo completo' })
  @ApiResponse({ status: 206, description: 'Trecho parcial (Range)' })
  @ApiResponse({ status: 404, description: 'Mídia não encontrada' })
  async downloadFile(
    @Param('id', ParseIntPipe) id: number,
    @Headers('range') range: string | undefined,
    @Res() res: express.Response,
  ) {
    const { absolutePath, size, contentType } =
      await this.mediaService.getFileForStreaming(id);

    if (!range) {
      res.writeHead(200, {
        'Content-Length': size,
        'Content-Type': contentType,
      });
      fs.createReadStream(absolutePath).pipe(res);
      return;
    }

    const [startStr, endStr] = range.replace(/bytes=/, '').split('-');
    const start = parseInt(startStr, 10);
    const end = endStr ? parseInt(endStr, 10) : size - 1;
    const chunkSize = end - start + 1;

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': contentType,
    });
    fs.createReadStream(absolutePath, { start, end }).pipe(res);
  }
}
