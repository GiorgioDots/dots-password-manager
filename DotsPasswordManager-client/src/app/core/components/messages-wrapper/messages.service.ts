import { Injectable } from '@angular/core';
import { MessageModel } from './message/message-model';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MessagesService {
  private _messages = new BehaviorSubject<MessageModel[]>([]);
  messages = this._messages.asObservable();

  constructor() {}

  addError(title: string, message: string, closeIn?: number) {
    this.addMessage(MessageType.error, title, message, closeIn);
  }
  addInfo(title: string, message: string, closeIn?: number) {
    this.addMessage(MessageType.info, title, message, closeIn);
  }
  addWarning(title: string, message: string, closeIn?: number) {
    this.addMessage(MessageType.warning, title, message, closeIn);
  }

  removeMessage(message: MessageModel) {
    this._messages.next([
      ...this._messages.getValue().filter(k => k != message),
    ]);
  }

  private addMessage(
    type: MessageType,
    title?: string,
    message?: string,
    closeIn?: number
  ) {
    this._messages.next([
      ...this._messages.getValue(),
      {
        type,
        title,
        message,
        closeIn,
      },
    ]);
  }
}

export enum MessageType {
  error = 'error',
  warning = 'warning',
  info = 'info',
}
