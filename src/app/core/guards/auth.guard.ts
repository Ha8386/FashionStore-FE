import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const AuthGuard: CanActivateFn = (): boolean | UrlTree => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Chỉ demo: nếu chưa đăng nhập thì về /login
  if (!auth.isLoggedIn) {
    return router.createUrlTree(['/login']);
  }
  return true;
};
