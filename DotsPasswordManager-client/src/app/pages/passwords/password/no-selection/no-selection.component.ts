import { DotsButtonDirective } from '@/app/core/components/ui/dots-button.directive';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Plus } from 'lucide-angular';

@Component({
  selector: 'app-no-selection',
  imports: [ RouterModule, LucideAngularModule, DotsButtonDirective],
  templateUrl: './no-selection.component.html',
  styleUrl: './no-selection.component.scss',
})
export class NoSelectionComponent {
  readonly PlusIcon = Plus;
}
