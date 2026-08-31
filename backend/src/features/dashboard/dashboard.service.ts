import { Injectable } from '@nestjs/common';
import { prisma } from '../../core/database/prisma';
import { nowBrasilia } from '../../core/utils/date-utils';
import { FindReportDto } from './dto/find-report-dto';

const ATTENTION_TOTEMS_LIMIT = 50;
const TOP_MEDIA_LIMIT = 10;

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

  async getReport(query: FindReportDto) {
    const start = query.startDate ? new Date(query.startDate) : new Date(0);
    const end = query.endDate
      ? new Date(`${query.endDate}T23:59:59.999`)
      : nowBrasilia();

    const periodFilter = { playedAt: { gte: start, lte: end } };

    const [
      totalClients,
      totalMedia,
      totalPlaybacksInPeriod,
      topMediaRows,
      playsByTotemRows,
      usedMediaIdRows,
      activeMedia,
    ] = await Promise.all([
      prisma.client.count(),
      prisma.media.count(),
      prisma.playbackLog.count({ where: periodFilter }),
      prisma.playbackLog.groupBy({
        by: ['mediaTitle'],
        where: periodFilter,
        _count: true,
        orderBy: { _count: { mediaTitle: 'desc' } },
        take: TOP_MEDIA_LIMIT,
      }),
      prisma.playbackLog.groupBy({
        by: ['totemId'],
        where: periodFilter,
        _count: true,
      }),
      prisma.playbackLog.findMany({
        where: { ...periodFilter, mediaId: { not: null } },
        select: { mediaId: true },
        distinct: ['mediaId'],
      }),
      prisma.media.findMany({
        where: { status: 'active' },
        select: { id: true, title: true },
      }),
    ]);

    // Reproduções por cliente: agrupado por totemId, mapeado pro client de cada totem
    const totemIds = playsByTotemRows.map((r) => r.totemId);
    const totems = totemIds.length
      ? await prisma.totem.findMany({
          where: { id: { in: totemIds } },
          select: {
            id: true,
            clientId: true,
            client: { select: { name: true } },
          },
        })
      : [];

    const totemToClient = new Map(
      totems.map((t) => [t.id, { id: t.clientId, name: t.client.name }]),
    );

    const clientPlayCounts = new Map<
      number,
      { clientName: string; playCount: number }
    >();
    for (const row of playsByTotemRows) {
      const client = totemToClient.get(row.totemId);
      if (!client) continue;
      const current = clientPlayCounts.get(client.id) ?? {
        clientName: client.name,
        playCount: 0,
      };
      current.playCount += row._count;
      clientPlayCounts.set(client.id, current);
    }

    const playsByClient = Array.from(clientPlayCounts.entries())
      .map(([clientId, v]) => ({
        clientId,
        clientName: v.clientName,
        playCount: v.playCount,
      }))
      .sort((a, b) => b.playCount - a.playCount);

    // Mídias ativas sem nenhuma reprodução no período
    const usedMediaIds = new Set(usedMediaIdRows.map((r) => r.mediaId));
    const unusedMedia = activeMedia.filter((m) => !usedMediaIds.has(m.id));

    return {
      totalClients,
      totalMedia,
      totalPlaybacksInPeriod,
      topMedia: topMediaRows.map((r) => ({
        mediaTitle: r.mediaTitle,
        playCount: r._count,
      })),
      playsByClient,
      unusedMedia: unusedMedia.map((m) => ({ id: m.id, title: m.title })),
    };
  }
}
