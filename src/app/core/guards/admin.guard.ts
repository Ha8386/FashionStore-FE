import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const AdminGuard: CanActivateFn = (): boolean | UrlTree => {
  const router = inject(Router);
  const auth = inject(AuthService);
  if (!auth.isLoggedIn) return router.createUrlTree(['/login']);
  return auth.role === 'ADMIN' ? true : router.createUrlTree(['/']);
};
