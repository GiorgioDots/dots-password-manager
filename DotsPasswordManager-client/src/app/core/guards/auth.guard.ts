import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { ClientAuthService } from '../services/auth/client-auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const clientAuth = inject(ClientAuthService);
  const router = inject(Router);
  if (!clientAuth.isLoggedIn()) {
    router.navigate(['/auth', 'login']);
  }
  return clientAuth.isLoggedIn();
};

export const notAuthGuard: CanActivateFn = (route, state) => {
  const clientAuth = inject(ClientAuthService);
  const router = inject(Router);
  if (clientAuth.isLoggedIn()) {
    router.navigate(['saved-passwords']);
  }
  return !clientAuth.isLoggedIn();
};
