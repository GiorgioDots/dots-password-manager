import { NgClass, NgStyle } from '@angular/common';
import { Component, signal } from '@angular/core';
import { LoaderCircle, LucideAngularModule } from 'lucide-angular';
import { LucideIconData } from 'node_modules/lucide-angular/icons/types';

@Component({
  selector: 'app-little-loader',
  imports: [LucideAngularModule, NgClass],
  templateUrl: './little-loader.component.html',
  styleUrl: './little-loader.component.scss',
})
export class LittleLoaderComponent {
  icon: LucideIconData | undefined;
  readonly LoaderCircleIcon = LoaderCircle;

  loading = signal(false);

  setLoading(load: boolean) {
    this.loading.set(load);
  }
}
