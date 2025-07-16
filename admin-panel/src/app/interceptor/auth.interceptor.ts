import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse, HttpErrorResponse, HttpClient
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, tap, filter, take, finalize } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');

    const isUsersOrBlockStatusRequest =
      req.url.includes('/auth/users') || req.url.includes('/auth/block-status');

    // Для обычных запросов добавляем заголовки
    const authReq = isUsersOrBlockStatusRequest
      ? req // для users/block-status не добавляем заголовки
      : req.clone({
          setHeaders: {
            Authorization: accessToken ? `Bearer ${accessToken}` : '',
            'X-Refresh-Token': refreshToken || ''
          }
        });

    return next.handle(authReq).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          const newAccessToken =
            event.headers.get('x-new-access-token') || event.headers.get('X-New-Access-Token');
          const newRefreshToken =
            event.headers.get('x-new-refresh-token') || event.headers.get('X-New-Refresh-Token');
          if (newAccessToken) localStorage.setItem('access_token', newAccessToken);
          if (newRefreshToken) localStorage.setItem('refresh_token', newRefreshToken);
        }
      }),
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          if (isUsersOrBlockStatusRequest) {
            // Обработка 401 для users/block-status через отдельный запрос refresh
            return this.handleUsersBlockStatusRefresh(req, next);
          } else {
            // Обработка 401 для остальных запросов через middleware + заголовки
            return this.handleMiddlewareRefresh(req, next);
          }
        }
        return throwError(() => error);
      })
    );
  }

  private handleUsersBlockStatusRefresh(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshToken = localStorage.getItem('refresh_token');
      const app_id = 1;

      if (!refreshToken) {
        this.logout();
        return throwError(() => new Error('No refresh token'));
      }

      return this.http.post<{ accessToken: string; refreshToken: string }>(
        'http://localhost:8080/auth/refresh',
        { refresh_token: refreshToken, app_id }
      ).pipe(
        switchMap(tokens => {
          localStorage.setItem('access_token', tokens.accessToken);
          localStorage.setItem('refresh_token', tokens.refreshToken);
          this.refreshTokenSubject.next(tokens.accessToken);

          // Повторяем запрос с токенами в теле
          const bodyWithTokens = {
            ...req.body,
            access_token: tokens.accessToken,
            app_id
          };
          const retryReq = req.clone({ body: bodyWithTokens });
          return next.handle(retryReq);
        }),
        catchError(err => {
          this.logout();
          return throwError(() => err);
        }),
        finalize(() => {
          this.isRefreshing = false;
        })
      );
    } else {
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(accessToken => {
          const app_id = 1;
          const bodyWithTokens = {
            ...req.body,
            access_token: accessToken,
            app_id
          };
          const retryReq = req.clone({ body: bodyWithTokens });
          return next.handle(retryReq);
        })
      );
    }
  }

  private handleMiddlewareRefresh(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshToken = localStorage.getItem('refresh_token');

      if (!refreshToken) {
        this.logout();
        return throwError(() => new Error('No refresh token'));
      }

      // Запрос к middleware для обновления токенов через заголовки
      return next.handle(req).pipe(
        catchError(error => {
          if (error.status === 401) {
            const newAccessToken =
              error.headers.get('x-new-access-token') || error.headers.get('X-New-Access-Token');
            const newRefreshToken =
              error.headers.get('x-new-refresh-token') || error.headers.get('X-New-Refresh-Token');

            if (newAccessToken && newRefreshToken) {
              localStorage.setItem('access_token', newAccessToken);
              localStorage.setItem('refresh_token', newRefreshToken);
              this.refreshTokenSubject.next(newAccessToken);
              const retryReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newAccessToken}`,
                  'X-Refresh-Token': newRefreshToken
                }
              });
              return next.handle(retryReq);
            } else {
              this.logout();
              return throwError(() => error);
            }
          } else {
            return throwError(() => error);
          }
        }),
        finalize(() => {
          this.isRefreshing = false;
        })
      );
    } else {
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(accessToken => {
          const retryReq = req.clone({
            setHeaders: {
              Authorization: `Bearer ${accessToken}`,
              'X-Refresh-Token': localStorage.getItem('refresh_token') || ''
            }
          });
          return next.handle(retryReq);
        })
      );
    }
  }

  private logout() {
    localStorage.clear();
    window.location.href = '/login';
  }
}
