import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, isDevMode } from '@angular/core';
//import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withInMemoryScrolling, withViewTransitions } from '@angular/router';
import { provideTransloco } from '@jsverse/transloco';
import { routes } from './app.routes';
import { authInterceptor } from './Core/interceptors/auth.interceptor';
import { loadingInterceptor } from './Core/interceptors/loading.interceptor';
import { tokenRefreshInterceptor } from './Core/interceptors/token-refresh.interceptor';
import { TranslocoHttpLoader } from './transloco-loader';

// Import locale registration
import { registerLocaleData } from '@angular/common';
import localeIt from '@angular/common/locales/it';

// Register Italian locale
registerLocaleData(localeIt);

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideRouter(routes, 
      withViewTransitions(),
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled'
      })
    ),
    provideHttpClient(
      withInterceptors([
        loadingInterceptor,      // First - handle loading state
        authInterceptor,         // Second - add authentication token
        tokenRefreshInterceptor, // Last - handle token refresh if needed
      ])
    ),
    provideTransloco({
      config: {
        availableLangs: ['en'],
        defaultLang: 'en',
        fallbackLang: 'en',
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
        missingHandler: {
          logMissingKey: true,
          useFallbackTranslation: true
        }
      },
      loader: TranslocoHttpLoader
    })
  ]
};
