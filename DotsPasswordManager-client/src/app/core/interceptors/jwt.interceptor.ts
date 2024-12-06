import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ClientAuthService } from '../services/auth/client-auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(ClientAuthService);

  const token = authService.getAccessToken();
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req);
};
