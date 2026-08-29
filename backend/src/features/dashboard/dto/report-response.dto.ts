import { ApiProperty } from '@nestjs/swagger';

export class ReportResponseDto {
  @ApiProperty({ example: 84 })
  totalClients: number;

  @ApiProperty({ example: 512 })
  totalMedia: number;
}
