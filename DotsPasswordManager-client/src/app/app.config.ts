import {
  ApplicationConfig,
  importProvidersFrom,
  inject,
  provideAppInitializer,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { routes } from './app.routes';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';
import { refreshTokenInterceptor } from './core/interceptors/refresh-token.interceptor';
import { ApiModule } from './core/main-api/api.module';
import { ClientCryptoService } from './core/services/e2e-encryption/client-crypto.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAppInitializer(() => {
      window
        .matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', (event) => {
          const theme = event.matches ? 'dark' : 'light';
          document.documentElement.setAttribute('data-theme', theme);
        });
      let theme = localStorage.getItem('app_theme');
      if (theme == null) {
        theme =
          window.matchMedia &&
          window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
      }
      document.documentElement.setAttribute('data-theme', theme);
      const cryptoSvc = inject(ClientCryptoService);
      return cryptoSvc.generateKeyPair();
    }),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([jwtInterceptor, refreshTokenInterceptor])
    ),
    provideAnimations(),
    importProvidersFrom(ApiModule.forRoot({ rootUrl: environment.rootUrl })),
  ],
};
