import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { FindCategoryDto } from './dto/find-category.dto';
import { PrismaService } from '../../core/database/prisma.service';
import { Prisma } from '../../../generated/prisma/client';
import { nowBrasilia } from '../../core/utils/date-utils';

@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCategoryDto, username: string) {
    try {
      const category = await this.prisma.client.category.create({
        data: {
          name: dto.name,
          createdAt: nowBrasilia(),
        },
      });
      this.logger.log(
        `Categoria criada por ${username} (id: ${category.id}, nome: ${category.name})`,
      );
      return category;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        this.logger.warn(
          `Tentativa de cadastro de categoria duplicada por ${username} (nome: ${dto.name})`,
        );
        throw new ConflictException('Categoria já cadastrada');
      }
      this.logger.error(
        `Falha ao criar categoria por ${username} (nome: ${dto.name}): ${this.extractErrorMessage(error)}`,
      );
      throw error;
    }
  }

  async findAll(query: FindCategoryDto) {
    return this.prisma.client.category.findMany({
      where: query.name ? { name: { contains: query.name } } : undefined,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    const category = await this.prisma.client.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    return category;
  }

  async update(id: number, dto: UpdateCategoryDto, username: string) {
    await this.findOne(id);

    try {
      const category = await this.prisma.client.category.update({
        where: { id },
        data: { name: dto.name },
      });
      this.logger.log(
        `Categoria atualizada por ${username} (id: ${id}, nome: ${category.name})`,
      );
      return category;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        this.logger.warn(
          `Tentativa de atualização com nome duplicado por ${username} (id: ${id}, nome: ${dto.name})`,
        );
        throw new ConflictException('Categoria já cadastrada');
      }
      this.logger.error(
        `Falha ao atualizar categoria por ${username} (id: ${id}): ${this.extractErrorMessage(error)}`,
      );
      throw error;
    }
  }

  async remove(id: number, username: string) {
    await this.findOne(id);
    await this.prisma.client.category.delete({ where: { id } });
    this.logger.log(`Categoria removida por ${username} (id: ${id})`);
  }

  private extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return 'erro desconhecido';
  }
}
