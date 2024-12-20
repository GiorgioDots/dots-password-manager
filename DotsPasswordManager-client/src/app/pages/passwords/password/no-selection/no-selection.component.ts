import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Plus } from 'lucide-angular';

@Component({
  selector: 'app-no-selection',
  imports: [ RouterModule, LucideAngularModule],
  templateUrl: './no-selection.component.html',
  styleUrl: './no-selection.component.scss',
})
export class NoSelectionComponent {
  readonly PlusIcon = Plus;
}
