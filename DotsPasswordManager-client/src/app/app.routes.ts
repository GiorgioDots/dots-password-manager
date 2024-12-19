import { Routes } from '@angular/router';
import { authGuard, notAuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Login',
    canActivate: [notAuthGuard],
    loadComponent: () =>
      import('@/app/pages/auth/login/login.component').then(
        (k) => k.LoginComponent
      ),
  },
  {
    path: 'register',
    title: 'Register',
    canActivate: [notAuthGuard],
    loadComponent: () =>
      import('@/app/pages/auth/register/register.component').then(
        (k) => k.RegisterComponent
      ),
  },
  {
    path: 'saved-passwords',
    title: 'Passwords',
    canActivate: [authGuard],
    loadComponent: () =>
      import('@/app/pages/passwords/passwords.component').then(
        (k) => k.PasswordsComponent
      ),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import(
            '@/app/pages/passwords/password/no-selection/no-selection.component'
          ).then((k) => k.NoSelectionComponent),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('@/app/pages/passwords/password/password.component').then(
            (k) => k.PasswordComponent
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'saved-passwords',
  },
];
