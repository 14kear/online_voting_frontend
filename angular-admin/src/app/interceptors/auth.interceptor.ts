import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService, private http: HttpClient) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const accessToken = this.auth.accessToken;

    const authReq = accessToken
      ? req.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } })
      : req;

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && this.auth.refreshToken) {
          return this.http.post<{ access_token: string; refresh_token: string }>(
            'http://localhost:8080/auth/refresh',
            { refresh_token: this.auth.refreshToken }
          ).pipe(
            switchMap((tokens) => {
              this.auth.saveTokens(tokens.access_token, tokens.refresh_token);
              const retryReq = req.clone({
                setHeaders: { Authorization: `Bearer ${tokens.access_token}` }
              });
              return next.handle(retryReq);
            }),
            catchError(() => {
              this.auth.clear();
              return throwError(() => error);
            })
          );
        }
        return throwError(() => error);
      })
    );
  }
}
