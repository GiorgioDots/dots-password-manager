import { ClientAuthService } from '@/app/core/services/auth/client-auth.service';
import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-passwords-body',
  imports: [MatIconModule],
  templateUrl: './passwords-body.component.html',
  styleUrl: './passwords-body.component.scss',
})
export class PasswordsBodyComponent {
  private clientAuth = inject(ClientAuthService);
  private router = inject(Router);

  logout() {
    this.clientAuth.logout();
    this.router.navigate(['login']);
  }

  toggleTheme() {
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', (event) => {
        const theme = event.matches ? 'frappe' : 'cupcake';
        document.documentElement.setAttribute('data-theme', theme);
      });
    let theme = localStorage.getItem('app_theme');
    if (theme == null) {
      theme =
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'frappe'
          : 'cupcake';
    }
    theme = theme == 'frappe' ? 'cupcake' : 'frappe';
    localStorage.setItem('app_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }
}
