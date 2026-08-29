import { Injectable } from '@nestjs/common';
import { prisma } from '../../core/database/prisma';
import { nowBrasilia } from '../../core/utils/date-utils';

const ATTENTION_TOTEMS_LIMIT = 50;

@Injectable()
export class DashboardService {
  async getDashboard() {
    const now = nowBrasilia();
    const cutoff24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const staleFilter = {
      OR: [{ lastSeenAt: null }, { lastSeenAt: { lt: cutoff24h } }],
    };

    const [
      totalTotems,
      online,
      offline,
      syncOver24h,
      totalClients,
      exclusiveClientRows,
      activeVids,
      attentionTotems,
    ] = await Promise.all([
      prisma.totem.count(),
      prisma.totem.count({ where: { status: 'online' } }),
      prisma.totem.count({ where: { status: 'offline' } }),
      prisma.totem.count({ where: staleFilter }),
      prisma.client.count(),
      prisma.totem.findMany({
        where: { contentMode: { in: ['exclusive', 'exclusive_strict'] } },
        select: { clientId: true },
        distinct: ['clientId'],
      }),
      prisma.media.count({ where: { status: 'active' } }),
      prisma.totem.findMany({
        where: { OR: [{ status: 'offline' }, staleFilter] },
        include: { client: { select: { name: true } } },
        orderBy: { lastSeenAt: 'asc' },
        take: ATTENTION_TOTEMS_LIMIT,
      }),
    ]);

    return {
      networkOverview: {
        totalTotems,
        online,
        offline,
        syncOver24h,
      },
      clientOperations: {
        totalClients,
        exclusiveClients: exclusiveClientRows.length,
        activeVids,
      },
      attentionTotems: attentionTotems.map((totem) => ({
        id: totem.id,
        name: totem.name,
        serial: totem.serial,
        clientName: totem.client.name,
        status:
          totem.status === 'offline'
            ? ('offline' as const)
            : ('sync_fail' as const),
        lastSeenAt: totem.lastSeenAt ? totem.lastSeenAt.toISOString() : null,
      })),
    };
  }

  async getReport() {
    // Totais gerais, sem filtro de período (client/media não têm relação
    // temporal que justifique filtrar por data aqui)
    const [totalClients, totalMedia] = await Promise.all([
      prisma.client.count(),
      prisma.media.count(),
    ]);

    return {
      totalClients,
      totalMedia,
    };
  }
}
