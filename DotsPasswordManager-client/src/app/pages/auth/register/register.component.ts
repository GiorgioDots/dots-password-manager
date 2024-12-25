import { LogoComponent } from '@/app/core/components/logo/logo.component';
import { DotsButtonDirective } from '@/app/core/components/ui/dots-button.directive';
import { UserAuthRegisterRequest } from '@/app/core/main-api/models';
import { AuthService } from '@/app/core/main-api/services';
import { ClientAuthService } from '@/app/core/services/auth/client-auth.service';
import { TypedFormGroup } from '@/app/core/utils/forms';
import { Component, signal, WritableSignal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import {
  Eye,
  EyeOff,
  LockKeyhole,
  LucideAngularModule,
  Mail,
  User,
} from 'lucide-angular';
import { of } from 'rxjs';

@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    RouterModule,
    LogoComponent,
    LucideAngularModule,
    DotsButtonDirective,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  readonly UserIcon = User;
  readonly LockKeyholeIcon = LockKeyhole;
  readonly EyeIcon = Eye;
  readonly EyeOffIcon = EyeOff;
  readonly MailIcon = Mail;

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
      ctrl => {
        return of(null);
      },
    ]);
    form
      .get('Password')
      ?.addValidators([Validators.required, Validators.minLength(6)]);

    this.form = signal(form);
  }

  onSubmit() {
    this.form().markAllAsTouched();
    if (this.form().invalid) {
      return;
    }

    const data = this.form().getRawValue() as UserAuthRegisterRequest;

    this.form().isLoading.set(true);

    this.authApi
      .userAuthRegisterEndpoint({
        body: data,
      })
      .subscribe({
        next: res => {
          this.form().isLoading.set(false);
          this.authService.setTokens(res.Token, res.RefreshToken);
          this.router.navigate(['/', 'saved-passwords']);
        },
        error: err => {
          this.form().isLoading.set(false);
          console.error('Login failed', err);
        },
      });
  }
}
