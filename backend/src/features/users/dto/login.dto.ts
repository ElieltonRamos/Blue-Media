import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'joao.silva' })
  @IsString({ message: 'Username deve ser um texto' })
  username: string;

  @ApiProperty({ example: 'senha123' })
  @IsString({ message: 'Senha deve ser um texto' })
  password: string;
}
