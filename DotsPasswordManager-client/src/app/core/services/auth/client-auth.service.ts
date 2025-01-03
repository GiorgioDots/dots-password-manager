import { ApiService } from '@/api/services';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { UserAuthLoginRequest } from '../../main-api/models';

@Injectable({
  providedIn: 'root',
})
export class ClientAuthService {
  private tokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<
    string | null
  >(null);

  constructor(private authApi: ApiService) {}

  login(data: UserAuthLoginRequest): Observable<any> {
    return this.authApi
      .userAuthLoginEndpoint({
        body: data,
      })
      .pipe(
        tap(response => {
          this.setTokens(response.Token, response.RefreshToken);
        })
      );
  }

  logout(): void {
    this.clearTokens();
  }

  refreshToken(): Observable<any> {
    const refreshToken = this.getRefreshToken();
    return this.authApi
      .userAuthRefreshTokenEndpoint({
        body: { Token: refreshToken ?? '' },
      })
      .pipe(
        tap(response => {
          this.setTokens(response.Token, response.RefreshToken);
        })
      );
  }

  getAccessToken(): string | undefined {
    return localStorage.getItem('accessToken') ?? undefined;
  }

  getRefreshToken(): string | undefined {
    return localStorage.getItem('refreshToken') ?? undefined;
  }

  setTokens(
    accessToken: string | undefined,
    refreshToken: string | undefined
  ): void {
    if (!accessToken || !refreshToken) {
      this.clearTokens();
      return;
    }
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    this.tokenSubject.next(accessToken);
  }

  private clearTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.tokenSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  onTokenChange(): Observable<string | null> {
    return this.tokenSubject.asObservable();
  }
}
