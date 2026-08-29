import { Component, OnInit, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DashboardService, DashboardData } from '../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard implements OnInit {
  private dashboardService = inject(DashboardService);

  data = signal<DashboardData | null>(null);
  loading = signal(true);

  modules = [
    {
      label: 'Clientes',
      description: 'Gerenciar entidades',
      route: '/dashboard/clientes',
      icon: 'building',
    },
    { label: 'Totens', description: 'Nós ativos', route: '/dashboard/totems', icon: 'monitor' },
    {
      label: 'Mídias',
      description: 'Armazenamento de mídia',
      route: '/dashboard/media',
      icon: 'image',
    },
    {
      label: 'Usuários',
      description: 'Administradores do sistema',
      route: '/dashboard/users',
      icon: 'users',
    },
    {
      label: 'Relatórios',
      description: 'Gerar métricas',
      route: '/dashboard/reports',
      icon: 'bar-chart',
    },
  ];

  ngOnInit(): void {
    this.dashboardService.getDashboard().subscribe({
      next: (res) => {
        this.data.set(res);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  formatDowntime(lastSeenAt: string | null): string {
    if (!lastSeenAt) return '—';
    const totalSeconds = Math.floor((Date.now() - new Date(lastSeenAt).getTime()) / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
  }

  formatSyncFailHours(lastSeenAt: string | null): string {
    if (!lastSeenAt) return '—';
    const hours = Math.floor((Date.now() - new Date(lastSeenAt).getTime()) / 3_600_000);
    return `Falha de Sync (${hours}h)`;
  }

  statusDotClass(status: 'offline' | 'sync_fail'): string {
    return status === 'offline'
      ? 'w-2 h-2 rounded-full inline-block bg-(--color-danger)'
      : 'w-2 h-2 rounded-full inline-block bg-(--color-text-muted)';
  }
}
