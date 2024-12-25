import { Routes } from '@angular/router';
import { authGuard, notAuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadComponent: () =>
      import('@/app/pages/auth/auth.component').then(m => m.AuthComponent),
    children: [
      {
        path: 'login',
        title: 'Login',
        canActivate: [notAuthGuard],
        loadComponent: () =>
          import('@/app/pages/auth/login/login.component').then(
            k => k.LoginComponent
          ),
      },
      {
        path: 'register',
        title: 'Register',
        canActivate: [notAuthGuard],
        loadComponent: () =>
          import('@/app/pages/auth/register/register.component').then(
            k => k.RegisterComponent
          ),
      },
      {
        path: 'reset-password-request',
        title: 'Reset password request',
        loadComponent: () =>
          import(
            '@/app/pages/auth/reset-password-request/reset-password-request.component'
          ).then(k => k.ResetPasswordRequestComponent),
      },
      {
        path: 'reset-password',
        title: 'Reset password',
        loadComponent: () =>
          import(
            '@/app/pages/auth/reset-password/reset-password.component'
          ).then(k => k.ResetPasswordComponent),
      },
      {
        path: '**',
        redirectTo: 'login',
      },
    ],
  },
  {
    path: 'saved-passwords',
    title: 'Passwords',
    canActivate: [authGuard],
    loadComponent: () =>
      import('@/app/pages/passwords/passwords.component').then(
        k => k.PasswordsComponent
      ),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import(
            '@/app/pages/passwords/password/no-selection/no-selection.component'
          ).then(k => k.NoSelectionComponent),
      },
      {
        path: 'settings',
        title: 'User settings',
        loadComponent: () =>
          import('@/app/pages/settings/settings.component').then(
            k => k.SettingsComponent
          ),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('@/app/pages/passwords/password/password.component').then(
            k => k.PasswordComponent
          ),
      },
    ],
  },

  {
    path: '**',
    redirectTo: 'saved-passwords',
  },
];
