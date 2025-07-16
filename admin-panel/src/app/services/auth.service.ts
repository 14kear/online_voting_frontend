import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient, private router: Router) {}

  get accessToken() {
    return localStorage.getItem('access_token');
  }

  get refreshToken() {
    return localStorage.getItem('refresh_token');
  }

  get appId() {
    return localStorage.getItem('app_id') || '1';
  }

  saveTokens(access: string, refresh: string) {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
  }

  clear() {
    localStorage.clear();
  }

  logout() {
    const refreshToken = this.refreshToken;
    const appId = Number(this.appId);

    if (!refreshToken) {
      this.clear();
      this.router.navigate(['/login']);
      return;
    }

    this.http.post('http://localhost:8080/auth/logout', {
      refreshToken,
      appId
    }).subscribe({
      next: () => {
        this.clear();
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Ошибка при выходе:', err);
        this.clear();
        this.router.navigate(['/login']);
      }
    });
  }
}
