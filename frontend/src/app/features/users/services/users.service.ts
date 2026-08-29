import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../core/services/environment';
import { CreateUserDto, UpdateUserDto, User } from '../types/users';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private apiUrl = environment.apiUrl;
  private http = inject(HttpClient);

  findAll() {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  create(dto: CreateUserDto) {
    return this.http.post<User>(`${this.apiUrl}/users`, dto);
  }

  update(id: number, dto: UpdateUserDto) {
    return this.http.patch<User>(`${this.apiUrl}/users/${id}`, dto);
  }

  remove(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/users/${id}`);
  }
}
