import { AuthService } from '@/api/services';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { UserLoginRequest } from '../../main-api/models/user-login-request';

@Injectable({
  providedIn: 'root',
})
export class ClientAuthService {
  private tokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<
    string | null
  >(null);

  constructor(private authApi: AuthService) {}

  login(data: UserLoginRequest): Observable<any> {
    return this.authApi
      .userLoginEndpoint({
        body: data,
      })
      .pipe(
        tap((response) => {
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
      .userRefreshTokenEndpoint({
        body: { Token: refreshToken ?? '' },
      })
      .pipe(
        tap((response) => {
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

  private setTokens(
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
