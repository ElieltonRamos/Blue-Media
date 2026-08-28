import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import 'multer';
import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { CreateMediaDto } from './dto/create-media.dto';
import { PrismaService } from '../../core/database/prisma.service';
import { nowBrasilia } from '../../core/utils/date-utils';
import * as mime from 'mime-types';

const STORAGE_ROOT = path.join(process.cwd(), 'storage', 'media');

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(private readonly prisma: PrismaService) {}

  private getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }

  private async assertClientExists(clientId: number): Promise<void> {
    const client = await this.prisma.client.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      throw new NotFoundException('Cliente não encontrado');
    }
  }

  private async saveFile(
    file: Express.Multer.File,
  ): Promise<{ filePath: string; checksum: string }> {
    await fs.mkdir(STORAGE_ROOT, { recursive: true });

    const ext = path.extname(file.originalname);
    const fileName = `${randomUUID()}${ext}`;
    const fullPath = path.join(STORAGE_ROOT, fileName);

    await fs.writeFile(fullPath, file.buffer);

    const checksum = crypto
      .createHash('sha256')
      .update(file.buffer)
      .digest('hex');

    return { filePath: path.relative(process.cwd(), fullPath), checksum };
  }

  private async deleteFile(filePath: string): Promise<void> {
    await fs.rm(path.join(process.cwd(), filePath), { force: true });
  }

  async create(
    dto: CreateMediaDto,
    file: Express.Multer.File,
    username: string,
  ) {
    if (!file) {
      throw new BadRequestException('Arquivo de vídeo é obrigatório');
    }

    if (dto.clientId !== undefined) {
      await this.assertClientExists(dto.clientId);
    }

    const { filePath, checksum } = await this.saveFile(file);

    try {
      const now = nowBrasilia();
      const media = await this.prisma.client.media.create({
        data: {
          clientId: dto.clientId,
          title: dto.title,
          filePath,
          checksum,
          duration: dto.duration,
          weight: dto.weight,
          createdAt: now,
          updatedAt: now,
        },
      });
      this.logger.log(`Media ${media.id} criada por ${username}`);
      return media;
    } catch (error) {
      await this.deleteFile(filePath);
      this.logger.error(
        `Erro ao criar media (${dto.title}): ${this.getErrorMessage(error)}`,
      );
      throw error;
    }
  }

  async findAll() {
    return this.prisma.client.media.findMany();
  }

  async findOne(id: number) {
    const media = await this.prisma.client.media.findUnique({
      where: { id },
    });

    if (!media) {
      throw new NotFoundException('Mídia não encontrada');
    }

    return media;
  }

  async remove(id: number, username: string) {
    const media = await this.findOne(id);

    try {
      await this.prisma.client.media.delete({ where: { id } });
      await this.deleteFile(media.filePath);
      this.logger.log(`Media ${id} removida por ${username}`);
    } catch (error) {
      this.logger.error(
        `Erro ao remover media ${id}: ${this.getErrorMessage(error)}`,
      );
      throw error;
    }
  }

  async registerPlayback(totemId: number, mediaId: number) {
    const media = await this.findOne(mediaId);

    try {
      return await this.prisma.client.playbackLog.create({
        data: {
          totemId,
          mediaId: media.id,
          mediaTitle: media.title,
          playedAt: nowBrasilia(),
        },
      });
    } catch (error) {
      this.logger.error(
        `Erro ao registrar playback (totem ${totemId}, media ${mediaId}): ${this.getErrorMessage(error)}`,
      );
      throw error;
    }
  }

  async getFileForStreaming(id: number) {
    const media = await this.findOne(id);
    const absolutePath = path.join(process.cwd(), media.filePath);

    const stats = await fs.stat(absolutePath);
    const contentType = mime.lookup(absolutePath) || 'application/octet-stream';

    return {
      absolutePath,
      size: stats.size,
      contentType,
    };
  }
}
