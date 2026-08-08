import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateClientDto {
  @ApiProperty({ description: 'Nome do cliente' })
  @IsString({ message: 'Nome deve ser um texto' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  name: string;

  @ApiProperty({ description: 'ID da categoria do cliente' })
  @IsInt({ message: 'categoryId deve ser um número inteiro' })
  @IsNotEmpty({ message: 'categoryId é obrigatório' })
  categoryId: number;
}
