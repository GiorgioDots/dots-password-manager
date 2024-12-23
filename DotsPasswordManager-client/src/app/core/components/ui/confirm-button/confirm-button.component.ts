import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  dotsButtonColors,
  DotsButtonDirective,
  dotsButtonSizes,
} from '../dots-button.directive';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-confirm-button',
  imports: [DotsButtonDirective, MatMenuModule, NgStyle],
  templateUrl: './confirm-button.component.html',
  styleUrl: './confirm-button.component.scss',
})
export class ConfirmButtonComponent {
  @Input() message: string = 'Do you want to continue?';
  @Input() buttonColor: dotsButtonColors | undefined;
  @Input() buttonSize: dotsButtonSizes | undefined;
  @Input() buttonStyle:
    | {
        [klass: string]: any;
      }
    | null
    | undefined;
  @Input() disabled: boolean | undefined;
  @Input() menuEnabled = true;

  @Output() confirm = new EventEmitter();

  handleMenuNotEnabled() {
    // Emits event
    this.confirm.emit();
  }
}
