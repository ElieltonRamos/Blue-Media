import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../core/services/environment';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '../types/category';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private apiUrl = environment.apiUrl;
  private http = inject(HttpClient);

  findAll(name?: string) {
    const params = name ? { name } : undefined;
    return this.http.get<Category[]>(`${this.apiUrl}/categories`, { params });
  }

  create(dto: CreateCategoryDto) {
    return this.http.post<Category>(`${this.apiUrl}/categories`, dto);
  }

  update(id: number, dto: UpdateCategoryDto) {
    return this.http.patch<Category>(`${this.apiUrl}/categories/${id}`, dto);
  }

  remove(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/categories/${id}`);
  }
}
