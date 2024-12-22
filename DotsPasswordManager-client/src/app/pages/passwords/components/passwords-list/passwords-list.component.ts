import { NgClass } from '@angular/common';
import {
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CircleX, LucideAngularModule, Search, Star } from 'lucide-angular';
import { debounceTime } from 'rxjs';
import { PasswordsCacheService } from '../../passwords-cache.service';

@Component({
  selector: 'app-passwords-list',
  imports: [ReactiveFormsModule, LucideAngularModule, RouterModule, NgClass],
  templateUrl: './passwords-list.component.html',
  styleUrl: './passwords-list.component.scss',
})
export class PasswordsListComponent implements OnInit {
  pwdCache = inject(PasswordsCacheService);

  readonly SearchIcon = Search;
  readonly CircleXIcon = CircleX;
  readonly StarIcon = Star;

  @ViewChild('searchInput') searchInput:
    | ElementRef<HTMLInputElement>
    | undefined;

  searchCtrl = new FormControl('');

  constructor() {
    this.searchCtrl.valueChanges.pipe(debounceTime(500)).subscribe((k) => {
      this.pwdCache.setFilter(k);
    });
  }

  ngOnInit(): void {
    this.pwdCache.getAll();
  }

  focusSearch() {
    if (!this.searchInput) return;
    this.searchInput.nativeElement.focus();
  }
}
