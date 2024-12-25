import { LogoComponent } from '@/app/core/components/logo/logo.component';
import { MessagesService } from '@/app/core/components/messages-wrapper/messages.service';
import { DotsButtonDirective } from '@/app/core/components/ui/dots-button.directive';
import { UserAuthResetPasswordRequestRequest } from '@/app/core/main-api/models';
import { AuthService } from '@/app/core/main-api/services';
import { ClientAuthService } from '@/app/core/services/auth/client-auth.service';
import { TypedFormGroup } from '@/app/core/utils/forms';
import { Component, inject, signal, WritableSignal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule, Mail } from 'lucide-angular';

@Component({
  selector: 'app-reset-password-request',
  imports: [
    LucideAngularModule,
    RouterModule,
    ReactiveFormsModule,
    DotsButtonDirective,
    LogoComponent,
  ],
  templateUrl: './reset-password-request.component.html',
  styleUrl: './reset-password-request.component.scss',
})
export class ResetPasswordRequestComponent {
  private authApi = inject(AuthService);
  private router = inject(Router);
  private messagesSvc = inject(MessagesService);

  readonly MailIcon = Mail;

  form: WritableSignal<TypedFormGroup<UserAuthResetPasswordRequestRequest>>;

  constructor() {
    const form = new TypedFormGroup<UserAuthResetPasswordRequestRequest>({
      Email: new FormControl(),
    });
    form.get('Email')?.addValidators([Validators.required, Validators.email]);
    this.form = signal(form);
  }

  onSubmit() {
    this.form().markAllAsTouched();
    if (this.form().invalid) {
      return;
    }

    this.form().isLoading.set(true);
    const data =
      this.form().getRawValue() as UserAuthResetPasswordRequestRequest;
    this.authApi
      .userAuthResetPasswordRequestEndpoint({
        body: data,
      })
      .subscribe({
        next: res => {
          this.form().isLoading.set(false);
          this.router.navigate(['/auth', 'login']);
          this.messagesSvc.addInfo(
            'Reset password request',
            res.Message ??
              'Check your email to continue with the password reset',
            10000
          );
        },
        error: err => {
          this.form().isLoading.set(false);
        },
      });
  }
}