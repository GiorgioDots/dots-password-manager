import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import {
  catchError,
  filter,
  Observable,
  switchMap,
  take,
  throwError,
} from 'rxjs';
import { UserAuthRefreshTokenResponse } from '../main-api/models';
import { ClientAuthService } from '../services/auth/client-auth.service';
import { RefreshTokenService } from '../services/auth/refresh-token.service';
import { MessagesService } from '../components/messages-wrapper/messages.service';
import { Router } from '@angular/router';

export const refreshTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(ClientAuthService);
  const refreshTokenService = inject(RefreshTokenService);
  const msgSvc = inject(MessagesService);
  const router = inject(Router);
  const errorDuration = 5000;

  const handleErrors = (error: any) => {
    const errors = error.error.Errors;
    if (errors && Object.keys(errors).length > 0) {
      for (let key in errors) {
        for (let errorMsg of errors[key]) {
          msgSvc.addError(error.error.Message, errorMsg, errorDuration);
        }
      }
    } else if (error.error.Message) {
      msgSvc.addError(
        error.error.Message,
        'An unexpected error occured',
        errorDuration
      );
    } else {
      msgSvc.addError('Error', 'An unexpected error occured', errorDuration);
    }
  };

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
        catchError(err => {
          if (err.status == 400) {
            handleErrors(err);
            return throwError(() => err);
          }
          refreshTokenService.isRefreshing = false;
          authService.logout();
          msgSvc.addError(
            'Session expired',
            'Your session has expired, please login again',
            errorDuration
          );
          router.navigate(['/auth', 'login']);
          return throwError(() => err);
        })
      );
    } else {
      return refreshTokenService.refreshTokenSubject.pipe(
        filter(token => token !== undefined),
        take(1),
        switchMap(token => {
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
    catchError(error => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        return handle401Error(req, next);
      }
      handleErrors(error);
      return throwError(() => error);
    })
  );
};
