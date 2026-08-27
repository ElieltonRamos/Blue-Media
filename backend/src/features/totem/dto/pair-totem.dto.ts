import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class PairTotemDto {
  @ApiProperty({ description: 'Código de pareamento de 6 dígitos' })
  @IsString({ message: 'Código deve ser um texto' })
  @Length(6, 6, { message: 'Código deve ter 6 dígitos' })
  code: string;

  @ApiProperty({ description: 'Identificador único do dispositivo' })
  @IsString({ message: 'deviceId deve ser um texto' })
  @IsNotEmpty({ message: 'deviceId é obrigatório' })
  deviceId: string;
}
