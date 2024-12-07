import {
  ApplicationConfig,
  importProvidersFrom,
  provideAppInitializer,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { environment } from 'src/environments/environment';
import { routes } from './app.routes';
import { ApiModule } from './core/main-api/api.module';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';
import { refreshTokenInterceptor } from './core/interceptors/refresh-token.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAppInitializer(() => {
      window
        .matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', (event) => {
          const theme = event.matches ? 'frappe' : 'cupcake';
          document.documentElement.setAttribute('data-theme', theme);
        });
      let theme = localStorage.getItem('app_theme');
      if (theme == null) {
        theme =
          window.matchMedia &&
          window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'frappe'
            : 'cupcake';
      }
      document.documentElement.setAttribute('data-theme', theme);
    }),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([jwtInterceptor, refreshTokenInterceptor])
    ),
    importProvidersFrom(ApiModule.forRoot({ rootUrl: environment.rootUrl })),
  ],
};
