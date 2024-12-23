import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-setting-block',
  imports: [],
  templateUrl: './setting-block.component.html',
  styleUrl: './setting-block.component.scss',
})
export class SettingBlockComponent {
  @Input() title = '';
}
