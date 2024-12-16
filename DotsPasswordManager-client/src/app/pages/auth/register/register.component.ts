import { LogoComponent } from '@/app/core/components/logo/logo.component';
import { UserAuthRegisterRequest } from '@/app/core/main-api/models';
import { AuthService } from '@/app/core/main-api/services';
import { ClientAuthService } from '@/app/core/services/auth/client-auth.service';
import { TypedFormGroup } from '@/app/core/utils/forms';
import { Component, signal, WritableSignal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { of } from 'rxjs';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, MatIconModule, RouterModule, LogoComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  passwordVisible = signal(false);
  form: WritableSignal<TypedFormGroup<UserAuthRegisterRequest>>;

  constructor(
    private authApi: AuthService,
    private router: Router,
    private authService: ClientAuthService
  ) {
    const form = new TypedFormGroup<UserAuthRegisterRequest>({
      Email: new FormControl(),
      Username: new FormControl(),
      Password: new FormControl(),
    });
    form.get('Email')?.addValidators([Validators.required, Validators.email]);
    form
      .get('Username')
      ?.addValidators([Validators.required, Validators.minLength(4)]);
    form.get('Username')?.addAsyncValidators([
      (ctrl) => {
        return of(null);
      },
    ]);
    form
      .get('Password')
      ?.addValidators([Validators.required, Validators.minLength(6)]);

    this.form = signal(form);
  }

  togglePwdVisibility() {
    this.passwordVisible.update((u) => !u);
  }

  onSubmit() {
    if (!this.form().valid) {
      return;
    }

    const data = this.form().getRawValue() as UserAuthRegisterRequest;

    this.form().disable();

    this.authApi
      .userAuthRegisterEndpoint({
        body: data,
      })
      .subscribe({
        next: (res) => {
          this.form().enable();
          this.authService.setTokens(res.Token, res.RefreshToken);
          this.router.navigate(['/', 'passwords']);
        },
        error: (err) => {
          this.form().enable();
          console.error('Login failed', err);
        },
      });
  }
}
