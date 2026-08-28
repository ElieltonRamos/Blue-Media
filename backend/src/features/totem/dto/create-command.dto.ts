import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import * as totemCommandService from '../totem-command.service';

const COMMAND_TYPES: totemCommandService.CommandType[] = [
  'reboot',
  'force_sync',
  'change_content_mode',
];

export class CreateCommandDto {
  @ApiProperty({ enum: COMMAND_TYPES, description: 'Tipo de comando' })
  @IsNotEmpty({ message: 'type é obrigatório' })
  @IsEnum(COMMAND_TYPES, { message: 'type inválido' })
  type: totemCommandService.CommandType;
}
