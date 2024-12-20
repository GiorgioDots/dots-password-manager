import { ClipboardModule } from '@angular/cdk/clipboard';
import { NgStyle } from '@angular/common';
import { Component, Input, signal } from '@angular/core';
import {
  ClipboardCheck,
  Clipboard as ClipboardIcon,
  LucideAngularModule,
} from 'lucide-angular';

@Component({
  selector: 'app-copy-clipboard-icon',
  imports: [ClipboardModule, NgStyle, LucideAngularModule],
  templateUrl: './copy-clipboard-icon.component.html',
  styleUrl: './copy-clipboard-icon.component.scss',
})
export class CopyClipboardIconComponent {
  @Input() copyValue: string = '';

  readonly ClipboardIcon = ClipboardIcon;
  readonly ClipboardCheckIcon = ClipboardCheck;

  iscopied = signal(false);

  private timeout: ReturnType<typeof setTimeout> | undefined;

  onCopied() {
    this.iscopied.set(true);
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.timeout = setTimeout(() => {
      this.iscopied.set(false);
    }, 5000);
  }
}
