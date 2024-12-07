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
    path: 'passwords',
    title: 'Passwords',
    canActivate: [authGuard],
    loadComponent: () =>
      import('@/app/pages/passwords/passwords.component').then(
        (k) => k.PasswordsComponent
      ),
  },
  {
    path: '**',
    redirectTo: 'passwords',
  },
];
