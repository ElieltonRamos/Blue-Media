import { Injectable } from '@angular/core';

export default interface User {
  id?: string;
  username: string;
  password: string;
  name: string;
  role?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Token {
  accessToken: string;
}

export interface TokenPayload {
  userId: number;
  username: string;
  role: string;
  iat: number;
  exp: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private decodePayload(token: string): TokenPayload {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  }

  isValidToken(token: string): boolean {
    if (!token) return false;

    try {
      const payload = this.decodePayload(token);
      const now = Math.floor(Date.now() / 1000);
      return payload.exp > now + 60;
    } catch {
      return false;
    }
  }

  hasRole(token: string, role: string): boolean {
    try {
      const payload = this.decodePayload(token);
      return payload.role === role;
    } catch {
      return false;
    }
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return this.isValidToken(token || '');
  }

  getTokenPayload(token?: string): TokenPayload | null {
    token = token || localStorage.getItem('token') || '';
    if (!token) return null;

    try {
      return this.decodePayload(token);
    } catch {
      return null;
    }
  }
}
