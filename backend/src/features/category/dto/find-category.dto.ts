import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class FindCategoryDto {
  @ApiPropertyOptional({
    description: 'Filtro por nome (case insensitive, busca parcial)',
  })
  @IsOptional()
  @IsString({ message: 'Nome deve ser um texto' })
  name?: string;
}
