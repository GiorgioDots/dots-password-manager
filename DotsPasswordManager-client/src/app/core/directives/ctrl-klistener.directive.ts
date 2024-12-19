import { Directive, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[appCtrlKListener]',
})
export class CtrlKListenerDirective {
  @Output() ctrlKPressed = new EventEmitter<void>();

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === 'k') {
      event.preventDefault();
      this.ctrlKPressed.emit();
    }
  }
}
