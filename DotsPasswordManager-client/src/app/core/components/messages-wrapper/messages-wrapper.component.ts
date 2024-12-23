import { Component, inject } from '@angular/core';
import { MessageComponent } from './message/message.component';
import { MessagesService } from './messages.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-messages-wrapper',
  imports: [MessageComponent, AsyncPipe],
  templateUrl: './messages-wrapper.component.html',
  styleUrl: './messages-wrapper.component.scss',
})
export class MessagesWrapperComponent {
  messagesSvc = inject(MessagesService);
  messages$ = this.messagesSvc.messages;
}
