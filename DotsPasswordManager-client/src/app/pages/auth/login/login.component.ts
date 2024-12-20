import { UserAuthLoginRequest } from '@/app/core/main-api/models';
import { ClientAuthService } from '@/app/core/services/auth/client-auth.service';
import { TypedFormGroup } from '@/app/core/utils/forms';
import { LogoComponent } from '@/cmp/logo/logo.component';
import { CommonModule } from '@angular/common';
import { Component, signal, WritableSignal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Eye, EyeOff, LockKeyhole, LucideAngularModule, User } from 'lucide-angular';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    RouterModule,
    LogoComponent,
    LucideAngularModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  readonly UserIcon = User;
  readonly LockKeyholeIcon = LockKeyhole;
  readonly EyeIcon = Eye;
  readonly EyeOffIcon = EyeOff;

  form: WritableSignal<TypedFormGroup<UserAuthLoginRequest>>;

  constructor(private authService: ClientAuthService, private router: Router) {
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

  onSubmit() {
    this.form().markAllAsTouched();
    if (this.form().invalid) {
      return;
    }

    this.form().disable();
    const data = this.form().getRawValue() as UserAuthLoginRequest;
    this.authService.login(data).subscribe({
      next: () => {
        this.form().enable();
        this.router.navigate(['/', 'saved-passwords']);
      },
      error: (err) => {
        this.form().enable();
        console.error('Login failed', err);
      },
    });
  }
}
