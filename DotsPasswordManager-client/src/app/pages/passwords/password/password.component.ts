import {
  UserSavedPasswordCreatePasswordRequest,
  UserSavedPasswordGetPasswordPasswordResponse,
} from '@/app/core/main-api/models';
import { PasswordsService } from '@/app/core/main-api/services';
import { ClientCryptoService } from '@/app/core/services/e2e-encryption/client-crypto.service';
import { TypedFormGroup } from '@/app/core/utils/forms';
import { Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { from, switchMap } from 'rxjs';

@Component({
  selector: 'app-password',
  imports: [ReactiveFormsModule, MatIconModule],
  templateUrl: './password.component.html',
  styleUrl: './password.component.scss',
})
export class PasswordComponent {
  pwdApi = inject(PasswordsService);
  clientCrypto = inject(ClientCryptoService);

  form = signal<
    TypedFormGroup<UserSavedPasswordGetPasswordPasswordResponse> | undefined
  >(undefined);

  isNew = signal(false);
  id = signal<string | null>(null);

  constructor(private route: ActivatedRoute) {
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
            console.log(pwd);
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

  initForm(pwd: UserSavedPasswordGetPasswordPasswordResponse) {
    this.form.set(
      new TypedFormGroup<UserSavedPasswordGetPasswordPasswordResponse>({
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

    this.form()!.setValue(pwd);
  }

  async decryptPwd(pwd: UserSavedPasswordGetPasswordPasswordResponse) {
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

  onSave() {
    const form = this.form();
    if (!form || form.invalid) return;

    if (this.isNew()) {
      const data = form.getRawValue() as UserSavedPasswordCreatePasswordRequest;
      console.log(data);
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
            this.init(res.Id ?? null);
          },
        });
    }
  }
}
