import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { DrawerComponent } from '@/cmp/bodies/drawer/drawer.component';
import { PasswordsBodyComponent } from '@/cmp/bodies/passwords-body/passwords-body.component';
import { CtrlKListenerDirective } from '@/app/core/directives/ctrl-klistener.directive';
import { MatDialog, DialogPosition } from '@angular/material/dialog';
import { QuickSearchDialogComponent } from '@/app/core/components/dialogs/quick-search-dialog/quick-search-dialog.component';

@Component({
  selector: 'app-passwords',
  imports: [
    PasswordsBodyComponent,
    MatIconModule,
    DrawerComponent,
    CtrlKListenerDirective,
  ],
  templateUrl: './passwords.component.html',
  styleUrl: './passwords.component.scss',
})
export class PasswordsComponent {
  constructor(private dialog: MatDialog) {}

  onQuickSearch() {
    this.dialog.open(QuickSearchDialogComponent, {
      position: { top: '6rem' },
    });
  }
}
