import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  get accessToken() {
    return localStorage.getItem('access_token');
  }

  get refreshToken() {
    return localStorage.getItem('refresh_token');
  }

  saveTokens(access: string, refresh: string) {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
  }

  clear() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
}
