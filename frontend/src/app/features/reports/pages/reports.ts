import { Component, OnInit, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { ReportsService } from '../services/reports.service';
import { NotificationService } from '../../../shared/toastr/notification.service';
import { ReportData } from '../types/reports';

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [],
  templateUrl: './reports.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Reports implements OnInit {
  private reportsService = inject(ReportsService);
  private notification = inject(NotificationService);

  startDate = signal(toDateInputValue(new Date()));
  endDate = signal(toDateInputValue(new Date()));

  data = signal<ReportData | null>(null);
  loading = signal(true);

  ngOnInit(): void {
    this.load();
  }

  onStartDateChange(value: string): void {
    this.startDate.set(value);
  }

  onEndDateChange(value: string): void {
    this.endDate.set(value);
  }

  setToday(): void {
    const today = toDateInputValue(new Date());
    this.startDate.set(today);
    this.endDate.set(today);
    this.load();
  }

  setThisWeek(): void {
    const now = new Date();
    const day = now.getDay(); // 0 = domingo
    const start = new Date(now);
    start.setDate(now.getDate() - day);
    this.startDate.set(toDateInputValue(start));
    this.endDate.set(toDateInputValue(now));
    this.load();
  }

  setThisMonth(): void {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    this.startDate.set(toDateInputValue(start));
    this.endDate.set(toDateInputValue(now));
    this.load();
  }

  applyFilter(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.reportsService
      .getReport({ startDate: this.startDate(), endDate: this.endDate() })
      .subscribe({
        next: (res) => {
          this.data.set(res);
          this.loading.set(false);
        },
        error: () => {
          this.notification.error('Não foi possível carregar o relatório');
          this.loading.set(false);
        },
      });
  }
}
