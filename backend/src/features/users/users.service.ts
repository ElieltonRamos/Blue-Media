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
import { prisma } from '../../core/database/prisma';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from '../../core/guards/jwt-auth.guard';
import { Prisma } from '../../../generated/prisma/client';

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
          email: dto.email,
          passwordHash,
          role: dto.role,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        this.logger.warn(
          `Tentativa de cadastro com email já existente: ${dto.email}`,
        );
        throw new ConflictException('Email já cadastrado');
      }
      this.logger.error(
        `Falha ao criar usuário (email: ${dto.email}): ${this.extractErrorMessage(error)}`,
      );
      throw error;
    }
  }

  async findAll() {
    return prisma.user.findMany();
  }

  async findOne(id: number) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return user;
  }

  async update(id: number, dto: UpdateUserDto) {
    try {
      return await prisma.user.update({ where: { id }, data: dto });
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
          `Tentativa de atualização com email já existente (id: ${id})`,
        );
        throw new ConflictException('Email já cadastrado');
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
    const user = await prisma.user.findUnique({ where: { email: dto.email } });

    if (!user) {
      this.logger.warn(
        `Tentativa de login com email não cadastrado: ${dto.email}`,
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
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return { accessToken };
  }

  private extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return 'erro desconhecido';
  }
}
