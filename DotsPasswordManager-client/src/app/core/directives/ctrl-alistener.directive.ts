import { Directive, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[appCtrlQListener]',
})
export class CtrlQListenerDirective {
  @Output() ctrlQPressed = new EventEmitter<void>();

  @HostListener('keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === 'q') {
      event.preventDefault();
      this.ctrlQPressed.emit();
    }
  }
}
