import { CopyClipboardIconComponent } from '@/app/core/components/copy-clipboard-icon/copy-clipboard-icon.component';
import { MessagesService } from '@/app/core/components/messages-wrapper/messages.service';
import { ConfirmButtonComponent } from '@/app/core/components/ui/confirm-button/confirm-button.component';
import { CtrlQListenerDirective } from '@/app/core/directives/ctrl-alistener.directive';
import { UserSavedPasswordDtOsSavedPasswordDto } from '@/app/core/main-api/models';
import { TypedFormGroup } from '@/app/core/utils/forms';
import PasswordGenerator from '@/app/core/utils/password-generator';
import { A11yModule } from '@angular/cdk/a11y';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  ChevronLeft,
  Eye,
  EyeOff,
  Link,
  LockKeyhole,
  LucideAngularModule,
  Pencil,
  RefreshCcw,
  RotateCw,
  Save,
  ScrollText,
  Tag,
  Trash,
  Trash2,
  User,
  UserPlus,
} from 'lucide-angular';
import { PasswordsCacheService } from '../passwords-cache.service';
import { isGuid } from '@/app/core/utils/regex';

@Component({
  selector: 'app-password',
  imports: [
    ReactiveFormsModule,
    RouterModule,
    FormsModule,
    CommonModule,
    ClipboardModule,
    CopyClipboardIconComponent,
    A11yModule,
    CtrlQListenerDirective,
    LucideAngularModule,
    ConfirmButtonComponent,
  ],
  templateUrl: './password.component.html',
  styleUrl: './password.component.scss',
})
export class PasswordComponent {
  private msgsSvc = inject(MessagesService);
  private pwdCache = inject(PasswordsCacheService);
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

  form = signal<TypedFormGroup<NoAutocompleteSavedPasswordDTO> | undefined>(
    undefined
  );

  tagInput = '';

  isNew = signal(false);
  id = signal<string | null>(null);

  @ViewChild('passwordInput') passwordInput:
    | ElementRef<HTMLInputElement>
    | undefined;

  constructor(route: ActivatedRoute) {
    route.paramMap.subscribe(params => {
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

      if (this.passwordInput) {
        this.passwordInput.nativeElement.type = 'password';
      }
    });
  }

  init(pwdId: string | null, forceRefresh = false) {
    this.id.set(pwdId);
    if (
      pwdId &&
      // check if GUID
      isGuid(
        pwdId
      )
    ) {
      this.isNew.set(false);
      this.form()?.disable();

      this.pwdCache.get(pwdId, forceRefresh).subscribe({
        next: pwd => {
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
      new TypedFormGroup<NoAutocompleteSavedPasswordDTO>({
        NotAName: new FormControl(),
        fu1: new FormControl(),
        SecondLogin: new FormControl(),
        fu2: new FormControl(),
        Notes: new FormControl(),
        Url: new FormControl(),
        Tags: new FormControl(),
      })
    );

    this.form()!.get('NotAName')?.addValidators([Validators.required]);
    this.form()!.get('fu1')?.addValidators([Validators.required]);
    this.form()!.get('fu2')?.addValidators([Validators.required]);

    this.form()!.setValue({
      NotAName: pwd.Name,
      fu1: pwd.Login,
      SecondLogin: pwd.SecondLogin,
      fu2: pwd.Password,
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

  onAddTag(tag: string) {
    if (tag == '') return;
    let currTags = this.form()?.get('Tags')?.value ?? [];
    if (currTags.some(k => k.toLowerCase() == tag.toLowerCase())) return;
    currTags.push(tag);
    this.form()?.get('Tags')?.setValue(currTags);
    this.form()?.markAsDirty();
  }

  onRemoveTag(tag: string) {
    if (tag == '') return;
    let currTags = this.form()?.get('Tags')?.value ?? [];
    currTags = currTags.filter(k => k != tag);
    this.form()?.get('Tags')?.setValue(currTags);
  }

  onSave() {
    const form = this.form();
    if (!form || form.invalid) return;

    form.markAllAsTouched();
    form.disable();

    const data = form.value as NoAutocompleteSavedPasswordDTO;
    const body = {
      Login: data.fu1,
      Name: data.NotAName,
      Password: data.fu2,
      CreatedAt: data.CreatedAt,
      IsFavourite: data.IsFavourite,
      Notes: data.Notes,
      PasswordId: data.PasswordId,
      SecondLogin: data.SecondLogin,
      Tags: data.Tags,
      UpdatedAt: data.UpdatedAt,
      Url: data.Url,
    };
    if (this.isNew()) {
      this.pwdCache.create(body).subscribe({
        next: res => {
          this.id.set(res.PasswordId!);
          this.isNew.set(false);
          this.initForm(res);
          this.router.navigate(['saved-passwords', res.PasswordId]);
        },
        error: () => {
          this.form()?.enable();
        },
      });
    } else {
      body.PasswordId = this.id()!;
      this.pwdCache.update(body).subscribe({
        next: res => {
          this.initForm(res);
        },
        error: () => {
          this.form()?.enable();
        },
      });
    }
  }

  onDelete() {
    if (this.isNew()) return;

    this.pwdCache.delete(this.id()!).subscribe({
      next: msg => {
        this.msgsSvc.addInfo('Completed', msg.Message!, 2000);
      },
      complete: () => {
        this.router.navigate(['saved-passwords']);
      },
    });
  }

  generatePassword() {
    const generated = PasswordGenerator.strongPassword();
    this.form()?.get('fu2')?.setValue(generated);
  }

  onRefresh() {
    this.init(this.id(), true);
  }

  onBack() {
    this.router.navigate(['/saved-password']);
  }
}

export interface NoAutocompleteSavedPasswordDTO {
  CreatedAt?: string;
  IsFavourite?: boolean;
  fu1: string;
  NotAName: string;
  Notes?: string;
  fu2: string;
  PasswordId?: string;
  SecondLogin?: string | null;
  Tags?: Array<string>;
  UpdatedAt?: string;
  Url?: string;
}
