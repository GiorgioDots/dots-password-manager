import { AfterViewInit, Component, inject, Input, signal } from '@angular/core';
import { MessageModel } from './message-model';
import { MessagesService, MessageType } from '../messages.service';
import { LucideAngularModule, X } from 'lucide-angular';

@Component({
  selector: 'app-message',
  imports: [LucideAngularModule],
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss',
})
export class MessageComponent implements AfterViewInit {
  @Input() message: MessageModel | undefined;

  readonly XIcon = X;

  private msgSvc = inject(MessagesService);

  colorClass = signal('')

  ngAfterViewInit(): void {
    console.log(this.message);
    if (this.message && this.message?.closeIn) {
      setTimeout(() => {
        this.msgSvc.removeMessage(this.message!);
      }, this.message.closeIn);

    }
    this.colorClass.set(this.getColorClass());
  }

  getColorClass(){
    if(!this.message) return '';
    return `msg-${this.message.type}`;
  }

  closeMessage() {
    if (!this.message) return;
    this.msgSvc.removeMessage(this.message);
  }
}
