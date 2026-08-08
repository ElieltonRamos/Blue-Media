import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { PrismaService } from '../../core/database/prisma.service';
import { nowBrasilia } from '../../core/utils/date-utils';

@Injectable()
export class ClientService {
  private readonly logger = new Logger(ClientService.name);

  constructor(private readonly prisma: PrismaService) {}

  private getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }

  private async assertCategoryExists(categoryId: number): Promise<void> {
    const category = await this.prisma.client.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }
  }

  private async assertNameIsUnique(
    name: string,
    excludeId?: number,
  ): Promise<void> {
    const existing = await this.prisma.client.client.findFirst({
      where: { name, ...(excludeId ? { id: { not: excludeId } } : {}) },
    });

    if (existing) {
      throw new ConflictException('Cliente já cadastrado');
    }
  }

  async create(dto: CreateClientDto, username: string) {
    await this.assertCategoryExists(dto.categoryId);
    await this.assertNameIsUnique(dto.name);

    try {
      const now = nowBrasilia();
      const client = await this.prisma.client.client.create({
        data: { ...dto, createdAt: now, updatedAt: now },
      });
      this.logger.log(`Cliente ${client.id} criado por ${username}`);
      return client;
    } catch (error) {
      this.logger.error(
        `Erro ao criar cliente (${dto.name}): ${this.getErrorMessage(error)}`,
      );
      throw error;
    }
  }

  async findAll() {
    return this.prisma.client.client.findMany();
  }

  async findOne(id: number) {
    const client = await this.prisma.client.client.findUnique({
      where: { id },
    });

    if (!client) {
      throw new NotFoundException('Cliente não encontrado');
    }

    return client;
  }

  async update(id: number, dto: UpdateClientDto, username: string) {
    await this.findOne(id);

    if (dto.categoryId !== undefined) {
      await this.assertCategoryExists(dto.categoryId);
    }

    if (dto.name !== undefined) {
      await this.assertNameIsUnique(dto.name, id);
    }

    try {
      const client = await this.prisma.client.client.update({
        where: { id },
        data: { ...dto, updatedAt: nowBrasilia() },
      });
      this.logger.log(`Cliente ${id} atualizado por ${username}`);
      return client;
    } catch (error) {
      this.logger.error(
        `Erro ao atualizar cliente ${id}: ${this.getErrorMessage(error)}`,
      );
      throw error;
    }
  }

  async remove(id: number, username: string) {
    await this.findOne(id);

    const [totemCount, mediaCount] = await Promise.all([
      this.prisma.client.totem.count({ where: { clientId: id } }),
      this.prisma.client.media.count({ where: { clientId: id } }),
    ]);

    if (totemCount > 0 || mediaCount > 0) {
      this.logger.warn(
        `Remoção do cliente ${id} bloqueada por ${username}: possui totens/media vinculados`,
      );
      throw new ConflictException('Cliente possui totens/media vinculados');
    }

    try {
      await this.prisma.client.client.delete({ where: { id } });
      this.logger.log(`Cliente ${id} removido por ${username}`);
    } catch (error) {
      this.logger.error(
        `Erro ao remover cliente ${id}: ${this.getErrorMessage(error)}`,
      );
      throw error;
    }
  }

  async findTotems(id: number) {
    await this.findOne(id);

    return this.prisma.client.totem.findMany({ where: { clientId: id } });
  }
}
