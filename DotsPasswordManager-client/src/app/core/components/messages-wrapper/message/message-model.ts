import { MessageType } from '../messages.service';

export interface MessageModel {
  type: MessageType;
  title?: string;
  message?: string;
  closeIn?: number;
}
