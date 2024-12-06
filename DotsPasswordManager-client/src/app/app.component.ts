import { Component } from '@angular/core';
import { ClientAuthService } from './core/services/auth/client-auth.service';
import { PasswordsService } from './core/main-api/services';
import { ClientCryptoService } from './core/services/e2e-encryption/client-crypto.service';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  constructor(
    private authService: ClientAuthService,
    private passwordsApi: PasswordsService,
    private clientCrypto: ClientCryptoService
  ) {}

  login() {
    this.clientCrypto
      .generateKeyPair()
      .pipe(
        switchMap(() => this.clientCrypto.exportPublicKey()),
        switchMap((publicKey) => {
          console.log(publicKey);
          return this.authService.login(
            'dodedodo96@gmail.com',
            'Pokerface96',
            publicKey
          );
        })
      )
      .subscribe({
        next: () => {
          console.log('Logged in successfully');
        },
        error: (err) => console.error('Login failed', err),
      });
  }

  exe() {
    this.passwordsApi
      .userSavedPasswordGetPasswordsEndpoint()
      // .pipe(
      //   switchMap((response) => {
      //     return this.clientCrypto.decryptData(response.passwords ?? '');
      //   })
      // )
      .subscribe(console.log);
  }

  create() {
    this.passwordsApi.userSavedPasswordCreatePasswordEndpoint({
      body: {
        Login: 'ahaho',
        Name: 'cuculu',
        Password: '*vfdnmjk34:::308fsd0',
        Notes: 'asdf',
      },
    }).subscribe(console.log);
  }

  logout() {
    this.authService.logout();
    console.log('Logged out');
  }
}
