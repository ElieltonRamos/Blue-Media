/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginDto } from './dto/login.dto';
import { Prisma } from '../../../generated/prisma/client';
import { prisma } from '../../core/database/prisma';
import { JwtPayload } from '../../core/guards/jwt-auth.guard';
import { nowBrasilia } from '../../core/utils/date-utils';

const USER_SAFE_SELECT = {
  id: true,
  name: true,
  username: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private jwtService: JwtService) {}

  async create(dto: CreateUserDto) {
    const passwordHash = await bcrypt.hash(dto.password, 10);

    try {
      return await prisma.user.create({
        data: {
          name: dto.name,
          username: dto.username,
          passwordHash,
          role: dto.role,
          createdAt: nowBrasilia(),
          updatedAt: nowBrasilia(),
        },
        select: USER_SAFE_SELECT,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        this.logger.warn(
          `Tentativa de cadastro com dado duplicado (username: ${dto.username})`,
        );
        throw new ConflictException(this.duplicateFieldMessage(error));
      }
      this.logger.error(
        `Falha ao criar usuário (username: ${dto.username}): ${this.extractErrorMessage(error)}`,
      );
      throw error;
    }
  }

  findAll() {
    return prisma.user.findMany({ select: USER_SAFE_SELECT });
  }

  async findOne(id: number) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: USER_SAFE_SELECT,
    });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return user;
  }

  async update(id: number, dto: UpdateUserDto) {
    try {
      return await prisma.user.update({
        where: { id },
        data: { ...dto, updatedAt: nowBrasilia() },
        select: USER_SAFE_SELECT,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Usuário não encontrado');
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        this.logger.warn(
          `Tentativa de atualização com dado duplicado (id: ${id})`,
        );
        throw new ConflictException(this.duplicateFieldMessage(error));
      }
      this.logger.error(
        `Falha ao atualizar usuário (id: ${id}): ${this.extractErrorMessage(error)}`,
      );
      throw error;
    }
  }

  async remove(id: number) {
    try {
      await prisma.user.delete({ where: { id } });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Usuário não encontrado');
      }
      this.logger.error(
        `Falha ao remover usuário (id: ${id}): ${this.extractErrorMessage(error)}`,
      );
      throw error;
    }
  }

  async login(dto: LoginDto) {
    const user = await prisma.user.findUnique({
      where: { username: dto.username },
    });

    if (!user) {
      this.logger.warn(
        `Tentativa de login com username não cadastrado: ${dto.username}`,
      );
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (!user.isActive) {
      this.logger.warn(`Tentativa de login em conta inativa (id: ${user.id})`);
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      this.logger.warn(`Senha inválida no login (id: ${user.id})`);
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload: JwtPayload = {
      userId: user.id,
      username: user.username,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return { accessToken };
  }

  private duplicateFieldMessage(
    error: Prisma.PrismaClientKnownRequestError,
  ): string {
    const target = error.meta?.target;
    const field = Array.isArray(target) ? target[0] : target;
    if (field === 'name') return 'Nome já cadastrado';
    if (field === 'username') return 'Username já cadastrado';
    return 'Dado já cadastrado';
  }

  private extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return 'erro desconhecido';
  }
}
