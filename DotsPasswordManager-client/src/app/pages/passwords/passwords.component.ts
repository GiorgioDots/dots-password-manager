import { QuickSearchDialogComponent } from '@/app/core/components/dialogs/quick-search-dialog/quick-search-dialog.component';
import { CtrlKListenerDirective } from '@/app/core/directives/ctrl-klistener.directive';
import { UserSavedPasswordGetPasswordsPasswordResponse } from '@/app/core/main-api/models/user-saved-password-get-passwords-password-response';
import { PasswordsService } from '@/app/core/main-api/services';
import { ClientCryptoService } from '@/app/core/services/e2e-encryption/client-crypto.service';
import { DrawerComponent } from '@/cmp/bodies/drawer/drawer.component';
import { PasswordsBodyComponent } from '@/cmp/bodies/passwords-body/passwords-body.component';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { from, switchMap } from 'rxjs';
import { PasswordsListComponent } from '../../core/components/passwords/passwords-list/passwords-list.component';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { PasswordSharedService } from '@/app/core/services/password-shared.service';
import {sortBy} from 'underscore';

@Component({
  selector: 'app-passwords',
  imports: [
    PasswordsBodyComponent,
    MatIconModule,
    DrawerComponent,
    CtrlKListenerDirective,
    PasswordsListComponent,
    RouterModule,
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

  passwords = signal<UserSavedPasswordGetPasswordsPasswordResponse[]>([]);


  ngOnInit(): void {
    this.passwordShared.passwordCreated.subscribe(() => {
      this.fetchPasswords();
    })
  }

  fetchPasswords(){
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
        const sorted = sortBy(res, (k) => k.Name?.toLowerCase())
        this.passwords.set(sorted);
      },
    });
  }

  onQuickSearch() {
    this.dialog.open(QuickSearchDialogComponent, {
      position: { top: '6rem' },
    });
  }

  onEdit(password?: UserSavedPasswordGetPasswordsPasswordResponse) {
    this.router.navigate(['passwords', password?.Id ?? 'new']);
  }
}
