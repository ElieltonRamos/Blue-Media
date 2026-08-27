import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateTotemDto } from './dto/create-totem.dto';
import { UpdateTotemDto } from './dto/update-totem.dto';
import { PrismaService } from '../../core/database/prisma.service';
import { nowBrasilia } from '../../core/utils/date-utils';
import { TotemPairingService } from './totem-pairing.service';

@Injectable()
export class TotemService {
  private readonly logger = new Logger(TotemService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly totemPairingService: TotemPairingService,
  ) {}

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

  private async assertSerialIsUnique(
    serial: string,
    excludeId?: number,
  ): Promise<void> {
    const existing = await this.prisma.client.totem.findFirst({
      where: { serial, ...(excludeId ? { id: { not: excludeId } } : {}) },
    });

    if (existing) {
      throw new ConflictException('Serial já cadastrado');
    }
  }

  async create(dto: CreateTotemDto, username: string) {
    await this.assertClientExists(dto.clientId);
    await this.assertSerialIsUnique(dto.serial);

    try {
      const now = nowBrasilia();
      const totem = await this.prisma.client.totem.create({
        data: { ...dto, createdAt: now, updatedAt: now },
      });
      const pairingCode = this.totemPairingService.generateCode(totem.id);
      this.logger.log(`Totem ${totem.id} criado por ${username}`);
      return { ...totem, pairingCode };
    } catch (error) {
      this.logger.error(
        `Erro ao criar totem (${dto.serial}): ${this.getErrorMessage(error)}`,
      );
      throw error;
    }
  }

  async findAll() {
    return this.prisma.client.totem.findMany();
  }

  async findOne(id: number) {
    const totem = await this.prisma.client.totem.findUnique({
      where: { id },
    });

    if (!totem) {
      throw new NotFoundException('Totem não encontrado');
    }

    return totem;
  }

  async update(id: number, dto: UpdateTotemDto, username: string) {
    await this.findOne(id);

    if (dto.clientId !== undefined) {
      await this.assertClientExists(dto.clientId);
    }

    if (dto.serial !== undefined) {
      await this.assertSerialIsUnique(dto.serial, id);
    }

    try {
      const totem = await this.prisma.client.totem.update({
        where: { id },
        data: { ...dto, updatedAt: nowBrasilia() },
      });
      this.logger.log(`Totem ${id} atualizado por ${username}`);
      return totem;
    } catch (error) {
      this.logger.error(
        `Erro ao atualizar totem ${id}: ${this.getErrorMessage(error)}`,
      );
      throw error;
    }
  }

  async remove(id: number, username: string) {
    await this.findOne(id);

    const [credentialCount, playbackLogCount] = await Promise.all([
      this.prisma.client.totemCredential.count({ where: { totemId: id } }),
      this.prisma.client.playbackLog.count({ where: { totemId: id } }),
    ]);

    if (credentialCount > 0 || playbackLogCount > 0) {
      this.logger.warn(
        `Remoção do totem ${id} bloqueada por ${username}: possui credenciais/logs vinculados`,
      );
      throw new ConflictException('Totem possui credenciais/logs vinculados');
    }

    try {
      await this.prisma.client.totem.delete({ where: { id } });
      this.logger.log(`Totem ${id} removido por ${username}`);
    } catch (error) {
      this.logger.error(
        `Erro ao remover totem ${id}: ${this.getErrorMessage(error)}`,
      );
      throw error;
    }
  }
}
