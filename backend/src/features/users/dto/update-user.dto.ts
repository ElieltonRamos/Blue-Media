import { ApiPropertyOptional, PartialType, OmitType } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password'] as const),
) {
  @ApiPropertyOptional({ example: 'novaSenha123', minLength: 6 })
  @IsOptional()
  @IsString({ message: 'Senha deve ser um texto' })
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  password?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean({ message: 'isActive deve ser um booleano' })
  isActive?: boolean;
}
