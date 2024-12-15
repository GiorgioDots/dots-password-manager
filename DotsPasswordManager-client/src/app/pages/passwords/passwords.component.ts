import { CtrlKListenerDirective } from '@/app/core/directives/ctrl-klistener.directive';
import { UserSavedPasswordDtOsSavedPasswordDto } from '@/app/core/main-api/models';
import { PasswordsService } from '@/app/core/main-api/services';
import { ClientAuthService } from '@/app/core/services/auth/client-auth.service';
import { ClientCryptoService } from '@/app/core/services/e2e-encryption/client-crypto.service';
import { PasswordSharedService } from '@/app/core/services/password-shared.service';
import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { debounceTime, from, switchMap } from 'rxjs';
import { filter, sortBy } from 'underscore';

@Component({
  selector: 'app-passwords',
  imports: [
    MatIconModule,
    CtrlKListenerDirective,
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
  ],
  templateUrl: './passwords.component.html',
  styleUrl: './passwords.component.scss',
})
export class PasswordsComponent implements OnInit {
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private passwordsApi = inject(PasswordsService);
  private clientCrypto = inject(ClientCryptoService);
  private passwordShared = inject(PasswordSharedService);
  private clientAuth = inject(ClientAuthService);

  sideClosed = signal(document.body.clientWidth < 576);

  searchCtrl = new FormControl('');

  passwords = signal<UserSavedPasswordDtOsSavedPasswordDto[]>([]);
  filteredPasswords = signal<UserSavedPasswordDtOsSavedPasswordDto[]>([]);

  favourites = computed(() => {
    return this.filteredPasswords().filter((k) => k.IsFavourite);
  });
  notFavourites = computed(() => {
    return this.filteredPasswords().filter((k) => !k.IsFavourite);
  });

  constructor() {
    this.searchCtrl.valueChanges.pipe(debounceTime(500)).subscribe((k) => {
      const filtered = filter(this.passwords(), (k) => {
        if (this.searchCtrl.value == undefined) return true;
        return k.Name.toLowerCase().includes(
          this.searchCtrl.value?.toLowerCase()
        );
      });
      this.filteredPasswords.set(filtered);
    });
  }

  ngOnInit(): void {
    this.passwordShared.passwordCreated.subscribe(() => {
      this.fetchPasswords();
    });
  }

  fetchPasswords() {
    this.passwordsApi
      .userSavedPasswordGetPasswordsEndpoint()
      .pipe(
        switchMap((res) => {
          const promises = res.map(async (k) => {
            k.Login = await this.clientCrypto.decryptDataAsync(k.Login!);
            k.Password = await this.clientCrypto.decryptDataAsync(k.Password!);
            if (k.SecondLogin) {
              k.SecondLogin = await this.clientCrypto.decryptDataAsync(
                k.SecondLogin
              );
            }
            return k;
          });
          return from(Promise.all(promises));
        })
      )
      .subscribe({
        next: (res) => {
          this.sort(res);
        },
      });
  }

  onEdit(password?: UserSavedPasswordDtOsSavedPasswordDto) {
    this.router.navigate(['passwords', password?.PasswordId ?? 'new']);
  }

  logout() {
    this.clientAuth.logout();
    this.router.navigate(['login']);
  }

  sort(passwords: UserSavedPasswordDtOsSavedPasswordDto[]) {
    const sorted = sortBy(passwords, (k) =>
      k.IsFavourite ? 1 + k.Name?.toLowerCase() : 2 + k.Name?.toLowerCase()
    );
    this.passwords.set(sorted);
    this.filteredPasswords.set(sorted);
  }

  toggleTheme() {
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', (event) => {
        const theme = event.matches ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
      });
    let theme = localStorage.getItem('app_theme');
    if (theme == null) {
      theme =
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
    }
    theme = theme == 'dark' ? 'light' : 'dark';
    localStorage.setItem('app_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }

  toggleFavourite(password: UserSavedPasswordDtOsSavedPasswordDto) {
    this.passwordsApi
      .userSavedPasswordToggleFavouriteEndpoint({
        Id: password.PasswordId!,
      })
      .subscribe({
        next: (res) => {
          password.IsFavourite = res.IsFavourite;
          this.sort(this.passwords());
        },
      });
  }
}
