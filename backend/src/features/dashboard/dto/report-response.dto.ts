import { ApiProperty } from '@nestjs/swagger';

class TopMediaDto {
  @ApiProperty({ example: 'Promoção Verão 2026' })
  mediaTitle: string;

  @ApiProperty({ example: 128 })
  playCount: number;
}

class PlaysByClientDto {
  @ApiProperty({ example: 1 })
  clientId: number;

  @ApiProperty({ example: 'Alpha Corp Logistics' })
  clientName: string;

  @ApiProperty({ example: 340 })
  playCount: number;
}

class UnusedMediaDto {
  @ApiProperty({ example: 12 })
  id: number;

  @ApiProperty({ example: 'Campanha Antiga' })
  title: string;
}

export class ReportResponseDto {
  @ApiProperty({ example: 84 })
  totalClients: number;

  @ApiProperty({ example: 512 })
  totalMedia: number;

  @ApiProperty({ example: 3420 })
  totalPlaybacksInPeriod: number;

  @ApiProperty({ type: [TopMediaDto] })
  topMedia: TopMediaDto[];

  @ApiProperty({ type: [PlaysByClientDto] })
  playsByClient: PlaysByClientDto[];

  @ApiProperty({ type: [UnusedMediaDto] })
  unusedMedia: UnusedMediaDto[];
}
