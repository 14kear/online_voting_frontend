import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService) as AuthService;
  const router = inject(Router);
  if (!auth.accessToken || !auth.refreshToken) {
    router.navigate(['/login']);
    return false;
  }
  return true;
};