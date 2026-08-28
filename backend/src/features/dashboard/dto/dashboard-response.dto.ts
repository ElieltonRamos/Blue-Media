import { ApiProperty } from '@nestjs/swagger';

class NetworkOverviewDto {
  @ApiProperty({ example: 1248 })
  totalTotems: number;

  @ApiProperty({ example: 1180 })
  online: number;

  @ApiProperty({ example: 68 })
  offline: number;

  @ApiProperty({ example: 12 })
  syncOver24h: number;
}

class ClientOperationsDto {
  @ApiProperty({ example: 84 })
  totalClients: number;

  @ApiProperty({ example: 32 })
  exclusiveClients: number;

  @ApiProperty({ example: 4200 })
  activeVids: number;
}

class AttentionTotemDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Main Hall Display' })
  name: string;

  @ApiProperty({ example: 'NODE-8F4A-99B' })
  serial: string;

  @ApiProperty({ example: 'Alpha Corp Logistics' })
  clientName: string;

  @ApiProperty({ enum: ['offline', 'sync_fail'], example: 'offline' })
  status: 'offline' | 'sync_fail';

  @ApiProperty({
    example: '2026-08-27T10:15:00.000Z',
    nullable: true,
    type: String,
  })
  lastSeenAt: string | null;
}

export class DashboardResponseDto {
  @ApiProperty({ type: NetworkOverviewDto })
  networkOverview: NetworkOverviewDto;

  @ApiProperty({ type: ClientOperationsDto })
  clientOperations: ClientOperationsDto;

  @ApiProperty({ type: [AttentionTotemDto] })
  attentionTotems: AttentionTotemDto[];
}
