import { UserLoginRequest } from '@/app/core/main-api/models/user-login-request';
import { ClientAuthService } from '@/app/core/services/auth/client-auth.service';
import { ClientCryptoService } from '@/app/core/services/e2e-encryption/client-crypto.service';
import { TypedFormGroup } from '@/app/core/utils/forms';
import { CommonModule } from '@angular/common';
import { Component, signal, WritableSignal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, MatIconModule, CommonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  passwordVisible = signal(false);

  form: WritableSignal<TypedFormGroup<UserLoginRequest>>;

  constructor(
    private clientCrypto: ClientCryptoService,
    private authService: ClientAuthService,
    private router: Router
  ) {
    const form = new TypedFormGroup<UserLoginRequest>({
      Login: new FormControl(),
      Password: new FormControl(),
    });
    form
      .get('Login')
      ?.addValidators([Validators.required, Validators.minLength(4)]);
    form
      .get('Password')
      ?.addValidators([Validators.required, Validators.minLength(6)]);

    const state = history.state as
      | { username: string; password: string }
      | undefined;
    if (state) {
      form.get('Login')?.setValue(state.username);
      form.get('Password')?.setValue(state.password);
      state.password = '';
      state.username = '';
    }
    this.form = signal(form);
  }

  togglePwdVisibility() {
    this.passwordVisible.update((u) => !u);
  }

  onSubmit() {
    if (!this.form().valid) {
      return;
    }

    const data = this.form().getRawValue() as UserLoginRequest;
    this.authService.login(data).subscribe({
      next: () => {
        this.router.navigate(['/', 'passwords']);
      },
      error: (err) => console.error('Login failed', err),
    });
  }
}
