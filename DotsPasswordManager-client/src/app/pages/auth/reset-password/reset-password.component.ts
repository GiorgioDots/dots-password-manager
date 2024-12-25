import { LogoComponent } from '@/app/core/components/logo/logo.component';
import { MessagesService } from '@/app/core/components/messages-wrapper/messages.service';
import { DotsButtonDirective } from '@/app/core/components/ui/dots-button.directive';
import { UserAuthResetPasswordRequest } from '@/app/core/main-api/models';
import { AuthService } from '@/app/core/main-api/services';
import { TypedFormGroup } from '@/app/core/utils/forms';
import { isGuid } from '@/app/core/utils/regex';
import { Component, inject, signal, WritableSignal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Eye, EyeOff, LockKeyhole, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-reset-password',
  imports: [
    LucideAngularModule,
    RouterModule,
    ReactiveFormsModule,
    DotsButtonDirective,
    LogoComponent,
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent {
  private authApi = inject(AuthService);
  private router = inject(Router);
  private messagesSvc = inject(MessagesService);
  private route = inject(ActivatedRoute);

  readonly LockKeyholeIcon = LockKeyhole;
  readonly EyeIcon = Eye;
  readonly EyeOffIcon = EyeOff;

  form: WritableSignal<TypedFormGroup<UserAuthResetPasswordRequestExt>>;

  constructor() {
    const form = new TypedFormGroup<UserAuthResetPasswordRequestExt>({
      NewPassword: new FormControl(),
      RepeatPassword: new FormControl(),
      RequestId: new FormControl(),
    });

    form.addValidators([passwordMatchValidator]);
    form.get('NewPassword')?.addValidators([Validators.required]);
    form.get('RepeatPassword')?.addValidators([Validators.required]);

    this.form = signal(form);

    this.route.queryParamMap.subscribe(params => {
      const reqId = params.get('r');
      if (!reqId || !isGuid(reqId)) {
        this.router.navigate(['/auth', 'login']);
        this.messagesSvc.addError(
          'Request invalid',
          'The request is invalid',
          3000
        );
        return;
      }
      this.form().get('RequestId')?.setValue(reqId);
    });
  }

  onSubmit() {
    this.form().markAllAsTouched();
    if (this.form().invalid) {
      return;
    }

    this.form().isLoading.set(true);
    const data = this.form().getRawValue() as UserAuthResetPasswordRequest;
    this.authApi
      .userAuthResetPasswordEndpoint({
        body: data,
      })
      .subscribe({
        next: res => {
          this.form().isLoading.set(false);
          this.router.navigate(['/auth', 'login']);
          this.messagesSvc.addInfo(
            'Password resetted successfully',
            res.Message ??
              'Please login with the new password!',
            10000
          );
        },
        error: err => {
          this.form().isLoading.set(false);
        },
      });
  }

  hasError(ctrlName: keyof UserAuthResetPasswordRequestExt, errorKey: string){
    const ctrl = this.form().get(ctrlName);
    if(!ctrl || !ctrl.errors || !ctrl.touched) return false;
    // console.log(ctrlName, ctrl.errors)

    return ctrl.errors[errorKey] != null;
  }
}

interface UserAuthResetPasswordRequestExt extends UserAuthResetPasswordRequest {
  RepeatPassword: string;
}

export const passwordMatchValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const password = control.get('NewPassword');
  const repeatPassword = control.get('RepeatPassword');

  console.log()

  if (password && repeatPassword && password.value !== repeatPassword.value) {
    repeatPassword.setErrors({ ...repeatPassword.errors, passwordMismatch: true });
    return { passwordMismatch: true };
  }

  // Clear the error if passwords match
  if (repeatPassword?.hasError('passwordMismatch')) {
    repeatPassword.setErrors(null);
  }

  return null;
};
