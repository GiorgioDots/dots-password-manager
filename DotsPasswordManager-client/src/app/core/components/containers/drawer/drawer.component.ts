import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal, WritableSignal } from '@angular/core';

@Component({
  selector: 'app-drawer',
  imports: [CommonModule],
  templateUrl: './drawer.component.html',
  styleUrl: './drawer.component.scss',
})
export class DrawerComponent {
  @Input() isClosed!: WritableSignal<boolean>;
  @Output() drawerClose = new EventEmitter()
}
