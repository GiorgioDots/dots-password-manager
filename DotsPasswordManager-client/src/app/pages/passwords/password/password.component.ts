import { UserSavedPasswordDtOsSavedPasswordDto } from '@/app/core/main-api/models';
import { PasswordsService } from '@/app/core/main-api/services';
import { ClientCryptoService } from '@/app/core/services/e2e-encryption/client-crypto.service';
import { PasswordSharedService } from '@/app/core/services/password-shared.service';
import { TypedFormGroup } from '@/app/core/utils/forms';
import {
  Component,
  inject,
  signal
} from '@angular/core';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { CopyClipboardIconComponent } from '@/app/core/components/copy-clipboard-icon/copy-clipboard-icon.component';
import { CtrlQListenerDirective } from '@/app/core/directives/ctrl-alistener.directive';
import PasswordGenerator from '@/app/core/utils/password-generator';
import { A11yModule } from '@angular/cdk/a11y';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ChevronLeft, Eye, EyeOff, Link, LockKeyhole, LucideAngularModule, Pencil, RefreshCcw, RotateCw, Save, ScrollText, Tag, Trash, Trash2, User, UserPlus } from 'lucide-angular';
import { from, switchMap } from 'rxjs';

@Component({
  selector: 'app-password',
  imports: [
    ReactiveFormsModule,
    RouterModule,
    FormsModule,
    MatMenuModule,
    CommonModule,
    ClipboardModule,
    CopyClipboardIconComponent,
    A11yModule,
    CtrlQListenerDirective,
    LucideAngularModule
  ],
  templateUrl: './password.component.html',
  styleUrl: './password.component.scss',
})
export class PasswordComponent {
  private pwdApi = inject(PasswordsService);
  private clientCrypto = inject(ClientCryptoService);
  private passwordShared = inject(PasswordSharedService);
  private router = inject(Router);

  readonly ChevronLeftIcon = ChevronLeft;
  readonly RefreshCCwIcon = RefreshCcw;
  readonly Trash2Icon = Trash2;
  readonly SaveIcon = Save;
  readonly PencilIcon = Pencil;
  readonly UserIcon = User;
  readonly UserPlusIcon = UserPlus;
  readonly LockKeyHoleIcon = LockKeyhole;
  readonly RotateCwIcon = RotateCw;
  readonly EyeIcon = Eye;
  readonly EyeOffIcon = EyeOff;
  readonly LinkIcon = Link;
  readonly ScrollTextIcon = ScrollText;
  readonly TagIcon = Tag;
  readonly TrashIcon = Trash;

  form = signal<
    TypedFormGroup<UserSavedPasswordDtOsSavedPasswordDto> | undefined
  >(undefined);

  tagInput = '';

  isNew = signal(false);
  id = signal<string | null>(null);

  constructor(route: ActivatedRoute) {
    route.paramMap.subscribe((params) => {
      this.tagInput = '';
      let paramId = params.get('id');
      let confirmInit = true;
      if (this.form()?.dirty && paramId != this.id()) {
        confirmInit = confirm(
          'You have some data changed, do you want to discard them?'
        );
      }
      if (confirmInit && paramId != this.id()) {
        this.init(paramId);
      } else {
        this.router.navigate(['/saved-passwords', this.id()]);
      }
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
    if (
      !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) ||
      this.isNew()
    ) {
      setTimeout(() => {
        const inp = document.getElementById('firstInput');
        inp?.focus();
      }, 200);
    }
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
    this.form()?.markAsDirty();
  }

  onRemoveTag(tag: string) {
    if (tag == '') return;
    let currTags = this.form()?.get('Tags')?.value ?? [];
    currTags = currTags.filter((k) => k != tag);
    this.form()?.get('Tags')?.setValue(currTags);
  }

  onSave() {
    const form = this.form();
    this.form()?.markAllAsTouched();
    console.log(this.form());
    if (!form || form.invalid) return;

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
            this.id.set(res.PasswordId!);
            this.isNew.set(false);
            this.initForm(res);
            this.passwordShared.setPasswordsChanged();
            this.router.navigate(['saved-passwords', res.PasswordId]);
          },
        });
    } else {
      const data = form.getRawValue() as UserSavedPasswordDtOsSavedPasswordDto;
      console.log(data);
      data.PasswordId = this.id()!;
      this.pwdApi
        .userSavedPasswordUpdatePasswordEndpoint({
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
            this.initForm(res);
          },
        });
    }
  }

  onDelete() {
    if (this.isNew()) return;

    this.pwdApi
      .userSavedPasswordDeletePasswordEndpoint({
        Id: this.id()!,
      })
      .subscribe({
        complete: () => {
          this.router.navigate(['saved-passwords']);
          this.passwordShared.setPasswordsChanged();
        },
      });
  }

  generatePassword() {
    const generated = PasswordGenerator.strongPassword();
    this.form()?.get('Password')?.setValue(generated);
  }

  onRefresh(menuTrigger: MatMenuTrigger) {
    if (this.form()?.dirty == false) {
      this.init(this.id());
      menuTrigger.closeMenu();
    }
  }

  onBack(menuTrigger: MatMenuTrigger) {
    if (this.form()?.dirty == false) {
      this.router.navigate(['/saved-password']);
      menuTrigger.closeMenu();
    }
  }
}
