import { UserAuthLoginRequest } from '@/app/core/main-api/models';
import { ClientAuthService } from '@/app/core/services/auth/client-auth.service';
import { TypedFormGroup } from '@/app/core/utils/forms';
import { CommonModule } from '@angular/common';
import { Component, signal, WritableSignal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { LogoComponent } from "../../../core/components/logo/logo.component";

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, MatIconModule, CommonModule, RouterModule, LogoComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  passwordVisible = signal(false);

  form: WritableSignal<TypedFormGroup<UserAuthLoginRequest>>;

  constructor(
    private authService: ClientAuthService,
    private router: Router
  ) {
    const form = new TypedFormGroup<UserAuthLoginRequest>({
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

    this.form().disable()
    const data = this.form().getRawValue() as UserAuthLoginRequest;
    this.authService.login(data).subscribe({
      next: () => {
        this.form().enable();
        this.router.navigate(['/', 'passwords']);
      },
      error: (err) => {
        this.form().enable();
        console.error('Login failed', err);
      },
    });
  }
}
