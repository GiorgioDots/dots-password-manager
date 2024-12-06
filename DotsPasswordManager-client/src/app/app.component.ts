import { Component } from '@angular/core';
import { ClientAuthService } from './core/services/auth/client-auth.service';
import { PasswordsService } from './core/main-api/services';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  constructor(
    private authService: ClientAuthService,
    private passwordsApi: PasswordsService
  ) {}

  login() {
    this.authService.login('dodedodo96@gmail.com', 'Pokerface96').subscribe({
      next: () => {
        console.log('Logged in successfully');
      },
      error: (err) => console.error('Login failed', err),
    });
  }

  exe() {
    this.passwordsApi.userSavedPasswordGetPasswordsEndpoint().subscribe();
  }

  logout() {
    this.authService.logout();
    console.log('Logged out');
  }
}
