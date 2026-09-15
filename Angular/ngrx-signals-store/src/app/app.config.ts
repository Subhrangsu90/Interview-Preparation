import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideLogger, withColor, withPrefix } from 'logger';
import { environment } from '@env/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withViewTransitions()),
    provideClientHydration(),
    provideLogger(
      { level: environment.logLevel },
      ...(environment.enableColorLogs ? [withColor()] : []),
      withPrefix('[App]')
    ),
  ]
};

