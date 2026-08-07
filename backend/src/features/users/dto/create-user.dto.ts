import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '../../../../generated/prisma/enums';

export class CreateUserDto {
  @ApiProperty({ example: 'João Silva', minLength: 2 })
  @IsString({ message: 'Nome deve ser um texto' })
  @MinLength(2, { message: 'Nome deve ter no mínimo 2 caracteres' })
  name: string;

  @ApiProperty({ example: 'joao.silva', minLength: 3 })
  @IsString({ message: 'Username deve ser um texto' })
  @MinLength(3, { message: 'Username deve ter no mínimo 3 caracteres' })
  username: string;

  @ApiProperty({ example: 'senha123', minLength: 6 })
  @IsString({ message: 'Senha deve ser um texto' })
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  password: string;

  @ApiPropertyOptional({ enum: UserRole, example: UserRole.operator })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Perfil inválido' })
  role?: UserRole;
}
