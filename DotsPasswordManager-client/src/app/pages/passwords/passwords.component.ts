import { LogoComponent } from '@/app/core/components/logo/logo.component';
import { CtrlKListenerDirective } from '@/app/core/directives/ctrl-klistener.directive';
import { UserSavedPasswordDtOsSavedPasswordDto } from '@/app/core/main-api/models';
import { ClientAuthService } from '@/app/core/services/auth/client-auth.service';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import {
  LogOut,
  LucideAngularModule,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Sun,
} from 'lucide-angular';
import { DrawerComponent } from '../../core/components/containers/drawer/drawer.component';
import { PasswordsListComponent } from './components/passwords-list/passwords-list.component';

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
  ],
  templateUrl: './passwords.component.html',
  styleUrl: './passwords.component.scss',
})
export class PasswordsComponent implements OnInit {
  private router = inject(Router);
  private clientAuth = inject(ClientAuthService);

  readonly PanelLeftCloseIcon = PanelLeftClose;
  readonly PanelLeftOpenIcon = PanelLeftOpen;
  readonly PlusIcon = Plus;
  readonly SunIcon = Sun;
  readonly MoonIcon = Moon;
  readonly LogOutIcon = LogOut;

  sideClosed = signal(document.body.clientWidth < 576);

  constructor() {}

  ngOnInit(): void {}

  onEdit(password?: UserSavedPasswordDtOsSavedPasswordDto) {
    this.router.navigate(['saved-passwords', password?.PasswordId ?? 'new']);
  }

  logout() {
    this.clientAuth.logout();
    this.router.navigate(['login']);
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
