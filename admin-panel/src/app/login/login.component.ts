// login.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [ReactiveFormsModule, CommonModule],
})
export class LoginComponent {
  loading = false;
  error: string | null = null;

  loginForm;

  private readonly APP_ID = 1;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  ngOnInit() {
    localStorage.clear(); 
  }

  login(): void {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.error = null;

    const { email, password } = this.loginForm.value as {
      email: string;
      password: string;
    };

    this.http
      .post<{
        accessToken: string;
        refreshToken: string;
        userId: number;
      }>('http://localhost:8080/auth/login', {
        app_id: this.APP_ID,
        email,
        password,
      })
      .pipe(
        switchMap((res) => {
          if (!res.accessToken || !res.refreshToken) {
            throw new Error('Недопустимые токены');
          }

          localStorage.setItem('access_token', res.accessToken);
          localStorage.setItem('refresh_token', res.refreshToken);
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('app_id', String(this.APP_ID));
          localStorage.setItem('user_id', String(res.userId));

          const admin$ = this.http.get<{ isAdmin: boolean }>(
            `http://localhost:8080/auth/admin/${res.userId}`
          );
          const blocked$ = this.http.get<{ isBlocked: boolean }>(
            `http://localhost:8080/auth/block-status/${res.userId}`
          );

          return forkJoin([admin$, blocked$]).pipe(
            map(([adminData, blockedData]) => ({
              adminData,
              blockedData,
            }))
          );
        })
      )
      .subscribe({
        next: ({ adminData, blockedData }) => {
          this.loading = false;

          if (blockedData.isBlocked) {
            localStorage.clear();
            this.router.navigate(['/']);
            return;
          }

          if (!adminData.isAdmin) {
            // Если не админ — показываем ошибку и не сохраняем флаг
            this.error = 'Доступ запрещён: недостаточно прав';
            localStorage.clear();
            return;
          }

          // Если админ — сохраняем флаг и переходим дальше
          localStorage.setItem('isAdmin', 'true');
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.loading = false;
          this.error =
            err?.message === 'Недопустимые токены'
              ? 'Ошибка авторизации: недопустимые токены'
              : err.status === 401 || err.status === 400
              ? 'Неверный email или пароль'
              : 'Ошибка при подключении к серверу';
        },
      });

  }
}
