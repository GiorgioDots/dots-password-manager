import { NgClass } from '@angular/common';
import {
  Component,
  ElementRef,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CircleX, LucideAngularModule, Search, Star } from 'lucide-angular';
import { debounceTime } from 'rxjs';
import { PasswordsCacheService } from '../../passwords-cache.service';
import { PasswordNavLinkComponent } from './password-nav-link/password-nav-link.component';

@Component({
  selector: 'app-passwords-list',
  imports: [ReactiveFormsModule, LucideAngularModule, PasswordNavLinkComponent],
  templateUrl: './passwords-list.component.html',
  styleUrl: './passwords-list.component.scss',
})
export class PasswordsListComponent implements OnInit {
  pwdCache = inject(PasswordsCacheService);

  readonly SearchIcon = Search;
  readonly CircleXIcon = CircleX;

  @ViewChild('searchInput') searchInput:
    | ElementRef<HTMLInputElement>
    | undefined;

  searchCtrl = new FormControl('');
  loading = signal(false);
  skeletons = Array(17)
    .fill(0)
    .map((_, i) => i);

  constructor() {
    this.searchCtrl.valueChanges.pipe(debounceTime(500)).subscribe(k => {
      this.pwdCache.setFilter(k);
    });
  }

  ngOnInit(): void {
    this.loading.set(true);
    this.pwdCache.getAll().subscribe({
      complete: () => {
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  focusSearch() {
    if (!this.searchInput) return;
    this.searchInput.nativeElement.focus();
  }
}
