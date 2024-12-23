import { UserSavedPasswordDtOsSavedPasswordDto } from '@/app/core/main-api/models';
import { NgClass } from '@angular/common';
import { Component, inject, Input, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LoaderCircle, LucideAngularModule, Star } from 'lucide-angular';
import { PasswordsCacheService } from '../../../passwords-cache.service';
import { DotsButtonDirective } from '@/app/core/components/ui/dots-button.directive';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-password-nav-link',
  imports: [
    RouterModule,
    NgClass,
    LucideAngularModule,
    DotsButtonDirective,
    MatTooltipModule,
  ],
  templateUrl: './password-nav-link.component.html',
  styleUrl: './password-nav-link.component.scss',
})
export class PasswordNavLinkComponent {
  @Input() password!: UserSavedPasswordDtOsSavedPasswordDto;
  pwdCache = inject(PasswordsCacheService);

  isLoading = signal(false);

  readonly StarIcon = Star;
  readonly LoaderCircleIcon = LoaderCircle;

  toggleFavourite() {
    if (!this.password || this.isLoading()) return;
    this.isLoading.set(true);
    this.pwdCache.toggleFavourite(this.password).subscribe({
      next: () => {
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }
}
