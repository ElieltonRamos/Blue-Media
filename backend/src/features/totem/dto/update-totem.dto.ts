import { PartialType } from '@nestjs/swagger';
import { CreateTotemDto } from './create-totem.dto';

export class UpdateTotemDto extends PartialType(CreateTotemDto) {}
