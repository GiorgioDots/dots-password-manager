import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { ClientAuthService } from '../services/auth/client-auth.service';
import { RefreshTokenService } from '../services/auth/refresh-token.service';
import {
  catchError,
  filter,
  Observable,
  switchMap,
  take,
  throwError,
} from 'rxjs';
import { ClientCryptoService } from '../services/e2e-encryption/client-crypto.service';
import { UserAuthRefreshTokenResponse } from '../main-api/models';

export const refreshTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(ClientAuthService);
  const refreshTokenService = inject(RefreshTokenService);
  const clientCrypto = inject(ClientCryptoService);

  const handle401Error = (
    req: HttpRequest<any>,
    next: HttpHandlerFn
  ): Observable<HttpEvent<any>> => {
    if (!refreshTokenService.isRefreshing) {
      refreshTokenService.isRefreshing = true;
      refreshTokenService.refreshTokenSubject.next(undefined);

      return authService.refreshToken().pipe(
        switchMap((tokenResponse: UserAuthRefreshTokenResponse) => {
          refreshTokenService.isRefreshing = false;
          refreshTokenService.refreshTokenSubject.next(tokenResponse.Token);
          return next(
            req.clone({
              setHeaders: {
                Authorization: `Bearer ${tokenResponse.Token}`,
              },
            })
          );
        }),
        catchError((err) => {
          refreshTokenService.isRefreshing = false;
          authService.logout();
          return throwError(() => err);
        })
      );
    } else {
      return refreshTokenService.refreshTokenSubject.pipe(
        filter((token) => token !== undefined),
        take(1),
        switchMap((token) => {
          return next(
            req.clone({
              setHeaders: {
                Authorization: `Bearer ${token}`,
              },
            })
          );
        })
      );
    }
  };

  return next(req).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        return handle401Error(req, next);
      }
      return throwError(() => error);
    })
  );
};
