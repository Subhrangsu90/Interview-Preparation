import { InjectionToken, Provider } from '@angular/core';

/**
 * Injection token for the base URL of the API.
 * Defaults to '/api'.
 */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => '/api',
});

/**
 * Helper provider function to configure the API base URL.
 *
 * Usage in app.config.ts:
 * ```typescript
 * providers: [
 *   provideApiBaseUrl('https://api.example.com/v1')
 * ]
 * ```
 */
export function provideApiBaseUrl(baseUrl: string): Provider {
  return {
    provide: API_BASE_URL,
    useValue: baseUrl,
  };
}
