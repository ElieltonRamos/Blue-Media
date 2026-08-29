import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../core/services/environment';
import { Client, CreateClientDto, UpdateClientDto } from '../types/client';

@Injectable({ providedIn: 'root' })
export class ClientsService {
  private apiUrl = environment.apiUrl;
  private http = inject(HttpClient);

  findAll() {
    return this.http.get<Client[]>(`${this.apiUrl}/clients`);
  }

  create(dto: CreateClientDto) {
    return this.http.post<Client>(`${this.apiUrl}/clients`, dto);
  }

  update(id: number, dto: UpdateClientDto) {
    return this.http.patch<Client>(`${this.apiUrl}/clients/${id}`, dto);
  }

  remove(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/clients/${id}`);
  }
}
