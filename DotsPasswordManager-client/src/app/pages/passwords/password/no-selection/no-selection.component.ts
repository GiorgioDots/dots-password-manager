import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-no-selection',
  imports: [MatIconModule, RouterModule],
  templateUrl: './no-selection.component.html',
  styleUrl: './no-selection.component.scss',
})
export class NoSelectionComponent {}
