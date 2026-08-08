import { ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CreateClientDto } from './create-client.dto';

export class UpdateClientDto extends PartialType(CreateClientDto) {
  @ApiPropertyOptional({ description: 'Nome do cliente' })
  @IsOptional()
  @IsString({ message: 'Nome deve ser um texto' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  name?: string;

  @ApiPropertyOptional({ description: 'ID da categoria do cliente' })
  @IsOptional()
  @IsInt({ message: 'categoryId deve ser um número inteiro' })
  categoryId?: number;
}
