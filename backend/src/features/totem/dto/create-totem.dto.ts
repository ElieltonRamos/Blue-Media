import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ContentMode } from '../../../../generated/prisma/enums';

export class CreateTotemDto {
  @ApiProperty({ description: 'ID do cliente' })
  @IsInt({ message: 'clientId deve ser um número inteiro' })
  @IsNotEmpty({ message: 'clientId é obrigatório' })
  clientId: number;

  @ApiProperty({ description: 'Nome do totem' })
  @IsString({ message: 'Nome deve ser um texto' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  name: string;

  @ApiPropertyOptional({ description: 'Localização do totem' })
  @IsOptional()
  @IsString({ message: 'Localização deve ser um texto' })
  location?: string;

  @ApiProperty({ description: 'Número de série (identificador único)' })
  @IsString({ message: 'Serial deve ser um texto' })
  @IsNotEmpty({ message: 'Serial é obrigatório' })
  serial: string;

  @ApiPropertyOptional({ enum: ContentMode, description: 'Modo de conteúdo' })
  @IsOptional()
  @IsEnum(ContentMode, { message: 'contentMode inválido' })
  contentMode?: ContentMode;
}
