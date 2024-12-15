import { ClipboardModule } from '@angular/cdk/clipboard';
import { NgStyle } from '@angular/common';
import { Component, Input, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-copy-clipboard-icon',
  imports: [ClipboardModule, MatIconModule, NgStyle],
  templateUrl: './copy-clipboard-icon.component.html',
  styleUrl: './copy-clipboard-icon.component.scss',
})
export class CopyClipboardIconComponent {
  @Input() copyValue: string = '';

  iscopied = signal(false);

  private timeout: ReturnType<typeof setTimeout> | undefined;

  onCopied() {
    this.iscopied.set(true);
    if(this.timeout) {
      clearTimeout(this.timeout);
    }
    this.timeout = setTimeout(() => {
      this.iscopied.set(false);
    }, 5000);
  }
}
