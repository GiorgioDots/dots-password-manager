import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthService } from '@/api/services';

@Injectable({
  providedIn: 'root',
})
export class ClientAuthService {
  private tokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<
    string | null
  >(null);

  constructor(private authApi: AuthService) {}

  login(
    username: string,
    password: string,
    publickKey: string
  ): Observable<any> {
    return this.authApi
      .userLoginEndpoint({
        body: { Login: username, Password: password, PublicKey: publickKey },
      })
      .pipe(
        tap((response) => {
          console.log(response.Token);
          this.setTokens(response.Token, response.RefreshToken);
        })
      );
  }

  logout(): void {
    this.clearTokens();
  }

  refreshToken(publicKey: string): Observable<any> {
    const refreshToken = this.getRefreshToken();
    return this.authApi
      .userRefreshTokenEndpoint({
        body: { Token: refreshToken ?? '', PublicKey: publicKey },
      })
      .pipe(
        tap((response) => {
          console.log(response);
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
    console.log("Setting tokens", accessToken, refreshToken)
    if (!accessToken || !refreshToken) {
      this.clearTokens();
      return;
    }
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    this.tokenSubject.next(accessToken);
  }

  private clearTokens(): void {
    console.log("Clearing tokens")
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
