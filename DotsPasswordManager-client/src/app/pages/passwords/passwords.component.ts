import { LogoComponent } from '@/app/core/components/logo/logo.component';
import { CtrlKListenerDirective } from '@/app/core/directives/ctrl-klistener.directive';
import { UserSavedPasswordDtOsSavedPasswordDto } from '@/app/core/main-api/models';
import { ClientAuthService } from '@/app/core/services/auth/client-auth.service';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import {
  CircleUser,
  LogOut,
  LucideAngularModule,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Settings,
  Sun,
} from 'lucide-angular';
import { DrawerComponent } from '../../core/components/containers/drawer/drawer.component';
import { PasswordsListComponent } from './components/passwords-list/passwords-list.component';
import { DotsButtonDirective } from '@/app/core/components/ui/dots-button.directive';
import { PasswordsCacheService } from './passwords-cache.service';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-passwords',
  imports: [
    CtrlKListenerDirective,
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    LogoComponent,
    LucideAngularModule,
    DrawerComponent,
    PasswordsListComponent,
    DotsButtonDirective,
    MatMenuModule,
  ],
  templateUrl: './passwords.component.html',
  styleUrl: './passwords.component.scss',
})
export class PasswordsComponent implements OnInit {
  private router = inject(Router);
  private clientAuth = inject(ClientAuthService);
  private pwdCache = inject(PasswordsCacheService);

  readonly PanelLeftCloseIcon = PanelLeftClose;
  readonly PanelLeftOpenIcon = PanelLeftOpen;
  readonly PlusIcon = Plus;
  readonly SunIcon = Sun;
  readonly MoonIcon = Moon;
  readonly LogOutIcon = LogOut;
  readonly SettingsIcon = Settings;
  readonly CircleUserIcon = CircleUser;

  sideClosed = signal(document.body.clientWidth < 576);

  constructor() {}

  ngOnInit(): void {}

  onEdit(password?: UserSavedPasswordDtOsSavedPasswordDto) {
    this.router.navigate(['saved-passwords', password?.PasswordId ?? 'new']);
  }

  logout() {
    this.clientAuth.logout();
    this.router.navigate(['/auth', 'login']);
    this.pwdCache.clear();
  }

  isDarkMode = signal(
    document.documentElement.getAttribute('data-theme') == 'dark'
  );

  toggleTheme() {
    let theme = localStorage.getItem('app_theme');
    if (theme == null) {
      theme =
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
    }
    theme = theme == 'dark' ? 'light' : 'dark';
    localStorage.setItem('app_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    this.isDarkMode.set(theme == 'dark');
  }
}
