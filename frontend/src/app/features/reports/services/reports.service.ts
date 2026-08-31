import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../core/services/environment';
import { ReportData, ReportFilters } from '../types/reports';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private apiUrl = environment.apiUrl;
  private http = inject(HttpClient);

  getReport(filters: ReportFilters) {
    return this.http.get<ReportData>(`${this.apiUrl}/dashboard/report`, {
      params: { startDate: filters.startDate, endDate: filters.endDate },
    });
  }
}
