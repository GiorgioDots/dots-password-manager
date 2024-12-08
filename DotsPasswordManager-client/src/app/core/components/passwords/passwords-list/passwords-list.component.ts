import { UserSavedPasswordGetPasswordsPasswordResponse } from '@/app/core/main-api/models/user-saved-password-get-passwords-password-response';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';

@Component({
  selector: 'app-passwords-list',
  imports: [],
  templateUrl: './passwords-list.component.html',
  styleUrl: './passwords-list.component.scss',
})
export class PasswordsListComponent {
  @Input() passwords = signal<UserSavedPasswordGetPasswordsPasswordResponse[]>(
    []
  );
  @Output() passwordSelected =
    new EventEmitter<UserSavedPasswordGetPasswordsPasswordResponse>();

  onClick(password: UserSavedPasswordGetPasswordsPasswordResponse) {
    this.passwordSelected.emit(password);
  }
}
