import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../core/services/environment';

export interface Category {
  id: number;
  name: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private apiUrl = environment.apiUrl;
  private http = inject(HttpClient);

  findAll(name?: string) {
    const params = name ? { name } : undefined;
    return this.http.get<Category[]>(`${this.apiUrl}/categories`, { params });
  }
}
