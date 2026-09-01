import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withViewTransitions, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';
import { routes } from './app.routes';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { eventTrackingInterceptor } from '@event-bus/interceptors';
import { environment } from '@env';
import { provideApiBaseUrl } from '@core/api';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withViewTransitions(), withComponentInputBinding()),
    provideClientHydration(),
    provideHttpClient(withInterceptors([loadingInterceptor, eventTrackingInterceptor])),
    provideApiBaseUrl(environment.apiBaseUrl)
  ],
};
