import {
UserSavedPasswordDtOsSavedPasswordDto
} from '@/app/core/main-api/models';
import { PasswordsService } from '@/app/core/main-api/services';
import { ClientCryptoService } from '@/app/core/services/e2e-encryption/client-crypto.service';
import { PasswordSharedService } from '@/app/core/services/password-shared.service';
import { TypedFormGroup } from '@/app/core/utils/forms';
import { Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { from, switchMap } from 'rxjs';

@Component({
  selector: 'app-password',
  imports: [ReactiveFormsModule, MatIconModule],
  templateUrl: './password.component.html',
  styleUrl: './password.component.scss',
})
export class PasswordComponent {
  private pwdApi = inject(PasswordsService);
  private clientCrypto = inject(ClientCryptoService);
  private passwordShared = inject(PasswordSharedService);

  form = signal<
    TypedFormGroup<UserSavedPasswordDtOsSavedPasswordDto> | undefined
  >(undefined);

  isNew = signal(false);
  id = signal<string | null>(null);

  private router = inject(Router);

  constructor(route: ActivatedRoute) {
    route.paramMap.subscribe((params) => {
      this.init(params.get('id'));
    });
  }

  init(pwdId: string | null) {
    this.id.set(pwdId);
    if (
      pwdId &&
      // check if GUID
      /^(?:\{{0,1}(?:[0-9a-fA-F]){8}-(?:[0-9a-fA-F]){4}-(?:[0-9a-fA-F]){4}-(?:[0-9a-fA-F]){4}-(?:[0-9a-fA-F]){12}\}{0,1})$/.exec(
        pwdId
      )
    ) {
      this.isNew.set(false);
      this.form()?.disable();
      this.pwdApi
        .userSavedPasswordGetPasswordEndpoint({
          Id: pwdId,
        })
        .pipe(
          switchMap((res) => {
            return from(this.decryptPwd(res));
          })
        )
        .subscribe({
          next: (pwd) => {
            this.initForm(pwd);
          },
        });
    } else {
      this.isNew.set(true);
      this.initForm({
        Name: '',
        Login: '',
        Password: '',
        Notes: '',
        SecondLogin: '',
        Tags: [],
        Url: '',
      });
    }
  }

  initForm(pwd: UserSavedPasswordDtOsSavedPasswordDto) {
    this.form.set(
      new TypedFormGroup<UserSavedPasswordDtOsSavedPasswordDto>({
        Name: new FormControl(),
        Login: new FormControl(),
        SecondLogin: new FormControl(),
        Password: new FormControl(),
        Notes: new FormControl(),
        Url: new FormControl(),
        Tags: new FormControl(),
      })
    );

    this.form()!.get('Name')?.addValidators([Validators.required]);
    this.form()!.get('Login')?.addValidators([Validators.required]);
    this.form()!.get('Password')?.addValidators([Validators.required]);

    this.form()!.setValue({
      Name: pwd.Name,
      Login: pwd.Login,
      SecondLogin: pwd.SecondLogin,
      Password: pwd.Password,
      Notes: pwd.Notes,
      Url: pwd.Url,
      Tags: pwd.Tags,
    });
  }

  async decryptPwd(pwd: UserSavedPasswordDtOsSavedPasswordDto) {
    pwd.Login = await this.clientCrypto.decryptDataAsync(pwd.Login!);
    pwd.Password = await this.clientCrypto.decryptDataAsync(pwd.Password!);
    if (pwd.SecondLogin) {
      pwd.SecondLogin = await this.clientCrypto.decryptDataAsync(
        pwd.SecondLogin!
      );
    }
    return pwd;
  }

  onAddTag(tag: string) {
    if (tag == '') return;
    let currTags = this.form()?.get('Tags')?.value ?? [];
    if (currTags.some((k) => k.toLowerCase() == tag.toLowerCase())) return;
    currTags.push(tag);
    this.form()?.get('Tags')?.setValue(currTags);
  }

  onRemoveTag(tag: string) {
    if (tag == '') return;
    let currTags = this.form()?.get('Tags')?.value ?? [];
    currTags = currTags.filter((k) => k != tag);
    this.form()?.get('Tags')?.setValue(currTags);
  }

  onSave() {
    const form = this.form();
    if (!form || form.invalid) return;

    this.form()?.updateValueAndValidity();
    this.form()?.disable();

    if (this.isNew()) {
      const data = form.getRawValue() as UserSavedPasswordDtOsSavedPasswordDto;
      this.pwdApi
        .userSavedPasswordCreatePasswordEndpoint({
          body: data,
        })
        .pipe(
          switchMap((ret) => {
            return from(this.decryptPwd(ret));
          })
        )
        .subscribe({
          next: (res) => {
            this.passwordShared.setPasswordsChanged();
            this.router.navigate(['passwords', res.PasswordId]);
          },
        });
    } else {
      const data = form.getRawValue() as UserSavedPasswordDtOsSavedPasswordDto;
      this.pwdApi
        .userSavedPasswordUpdatePasswordEndpoint({
          body: data,
          id: this.id()!,
        })
        .pipe(
          switchMap((ret) => {
            return from(this.decryptPwd(ret));
          })
        )
        .subscribe({
          next: (res) => {
            this.passwordShared.setPasswordsChanged();
            this.initForm(res);
          },
        });
    }
  }
}
