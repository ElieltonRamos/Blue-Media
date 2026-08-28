import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMediaDto {
  @ApiPropertyOptional({ description: 'ID do cliente (vazio = institucional)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'clientId deve ser um número inteiro' })
  clientId?: number;

  @ApiProperty({ description: 'Título da mídia' })
  @IsString({ message: 'Título deve ser um texto' })
  @IsNotEmpty({ message: 'Título é obrigatório' })
  title: string;

  @ApiProperty({ description: 'Duração do vídeo em segundos' })
  @Type(() => Number)
  @IsInt({ message: 'duration deve ser um número inteiro' })
  @Min(1, { message: 'duration deve ser maior que zero' })
  duration: number;

  @ApiPropertyOptional({ description: 'Peso na rotação da playlist' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'weight deve ser um número inteiro' })
  @Min(1, { message: 'weight deve ser maior que zero' })
  weight?: number;
}
