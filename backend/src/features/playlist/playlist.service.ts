import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { ContentMode } from '../../../generated/prisma/enums';

export interface PlaylistItem {
  mediaId: number;
  title: string;
  url: string;
  duration: number;
  checksum: string;
}

@Injectable()
export class PlaylistService {
  private readonly logger = new Logger(PlaylistService.name);

  constructor(private readonly prisma: PrismaService) {}

  private shuffle<T>(items: T[]): T[] {
    const array = [...items];
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  private buildFileUrl(mediaId: number): string {
    const baseUrl = process.env.APP_BASE_URL ?? 'http://localhost:3000';
    return `${baseUrl}/media/${mediaId}/file`;
  }

  async resolve(totemId: number): Promise<PlaylistItem[]> {
    const totem = await this.prisma.client.totem.findUnique({
      where: { id: totemId },
      include: { client: true },
    });

    if (!totem) {
      throw new NotFoundException('Totem não encontrado');
    }

    const ownerClientId = totem.clientId;
    const ownerCategoryId = totem.client.categoryId;

    const candidates = await this.prisma.client.media.findMany({
      where: { status: 'active' },
      include: { client: true },
    });

    const allowed = candidates.filter((media) => {
      if (media.clientId === ownerClientId) {
        return true;
      }

      if (totem.contentMode === ContentMode.exclusive_strict) {
        return false;
      }

      if (media.clientId === null) {
        return true;
      }

      if (totem.contentMode !== ContentMode.shared) {
        return false;
      }

      return media.client?.categoryId !== ownerCategoryId;
    });

    const pool = allowed.flatMap((media) =>
      Array.from({ length: media.weight }, () => media),
    );

    const shuffled = this.shuffle(pool);

    this.logger.log(
      `Playlist resolvida para totem ${totemId}: ${allowed.length} mídias únicas, ${shuffled.length} itens na sequência`,
    );

    return shuffled.map((media) => ({
      mediaId: media.id,
      title: media.title,
      url: this.buildFileUrl(media.id),
      duration: media.duration,
      checksum: media.checksum,
    }));
  }
}
