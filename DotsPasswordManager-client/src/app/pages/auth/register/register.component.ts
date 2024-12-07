import { UserRegisterRequest } from '@/app/core/main-api/models/user-register-request';
import { AuthService } from '@/app/core/main-api/services';
import { TypedFormGroup } from '@/app/core/utils/forms';
import { Component, signal, WritableSignal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { of } from 'rxjs';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, MatIconModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  passwordVisible = signal(false);
  form: WritableSignal<TypedFormGroup<UserRegisterRequest>>;

  constructor(private authApi: AuthService, private router: Router) {
    const form = new TypedFormGroup<UserRegisterRequest>({
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

    const data = this.form().getRawValue() as UserRegisterRequest;

    this.authApi
      .userRegisterEndpoint({
        body: data,
      })
      .subscribe({
        complete: () => {
          this.router.navigate(['login'], {
            state: {
              username: data.Username,
              password: data.Password,
            },
          });
        },
      });
  }
}
