import { Component, inject, signal } from '@angular/core';
import { SettingBlockComponent } from './setting-block/setting-block.component';
import { DotsButtonDirective } from '@/app/core/components/ui/dots-button.directive';
import {
  Download,
  LoaderCircle,
  LucideAngularModule,
  Upload,
} from 'lucide-angular';
import { PasswordsService } from '@/app/core/main-api/services';
import { UserSavedPasswordDtOsImportExportDto } from '@/app/core/main-api/models';
import { UserSavedPasswordImportEndpoint$Params } from '@/app/core/main-api/fn/passwords/user-saved-password-import-endpoint';
import { PasswordsCacheService } from '../passwords/passwords-cache.service';
import { MessagesService } from '@/app/core/components/messages-wrapper/messages.service';

@Component({
  selector: 'app-settings',
  imports: [SettingBlockComponent, DotsButtonDirective, LucideAngularModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
  private passwordsApi = inject(PasswordsService);
  private pwdCache = inject(PasswordsCacheService);
  private msgsSvc = inject(MessagesService);

  readonly DownloadIcon = Download;
  readonly UploadIcon = Upload;
  readonly LoaderCircleIcon = LoaderCircle;

  exportLoading = signal(false);
  importLoading = signal(false);

  onExport() {
    this.exportLoading.set(true);
    this.passwordsApi.userSavedPasswordExportEndpoint().subscribe({
      next: passwords => {
        this.exportLoading.set(false);
        const data = JSON.stringify(passwords, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'export.json';
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.exportLoading.set(false);
      },
    });
  }

  async importInputChanged(importInput: HTMLInputElement) {
    if (!importInput.files || importInput.files.length == 0) return;
    const file = importInput.files[0];
    importInput.value = '';
    if (file.name.split('.').pop() != 'json') return;
    const data = JSON.parse(
      await file.text()
    ) as UserSavedPasswordDtOsImportExportDto;
    this.importLoading.set(true);
    this.passwordsApi
      .userSavedPasswordImportEndpoint({
        body: data,
      })
      .subscribe({
        next: response => {
          this.importLoading.set(false);
          this.pwdCache.getAll(true);
          this.msgsSvc.addInfo(
            'Success!',
            'The passwords where imported successfully',
            3000
          );
        },
        error: () => {
          this.importLoading.set(false);
        },
      });
  }

  onImport() {}
}
