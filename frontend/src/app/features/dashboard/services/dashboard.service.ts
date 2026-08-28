import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../core/services/environment';

export interface AttentionTotem {
  id: number;
  name: string;
  serial: string;
  clientName: string;
  status: 'offline' | 'sync_fail';
  lastSeenAt: string | null;
}

export interface DashboardData {
  networkOverview: {
    totalTotems: number;
    online: number;
    offline: number;
    syncOver24h: number; // lastSeenAt < now - 24h
  };
  clientOperations: {
    totalClients: number;
    exclusiveClients: number; // clientes distintos com Totem.contentMode in [exclusive, exclusive_strict]
    activeVids: number; // Media.status = active
  };
  attentionTotems: AttentionTotem[]; // status = offline OU lastSeenAt < now - 24h
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private apiUrl = environment.apiUrl;
  private client = inject(HttpClient);

  getDashboard() {
    // TODO: endpoint GET /dashboard ainda não implementado no backend
    return this.client.get<DashboardData>(`${this.apiUrl}/dashboard`);
  }
}
