import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ClientAuthService } from '../services/auth/client-auth.service';
import { ClientCryptoService } from '../services/e2e-encryption/client-crypto.service';
import { switchMap } from 'rxjs';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(ClientAuthService);
  const clientCrypto = inject(ClientCryptoService);
  const token = authService.getAccessToken();
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  return clientCrypto.exportPublicKey().pipe(
    switchMap(publickey => {
      req = req.clone({
        setHeaders: {
          'x-public-key': publickey,
        },
      });
      return next(req);
    })
  );
};
