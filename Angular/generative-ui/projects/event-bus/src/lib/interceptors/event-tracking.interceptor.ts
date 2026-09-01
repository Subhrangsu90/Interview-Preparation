import { HttpInterceptorFn, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs/operators';
import { EventBusService } from '../services/event-bus.service';
import { TelemetryEvents } from '../models/event-names.constants';

/**
 * Functional HTTP interceptor that emits telemetry events onto the EventBus
 * for every outgoing HTTP request, response, and error.
 */
export const eventTrackingInterceptor: HttpInterceptorFn = (req, next) => {
  const eventBus = inject(EventBusService);
  const startTime = performance.now();
  const url = req.urlWithParams || req.url;

  // Emit request start
  eventBus.emit({
    source: 'http',
    category: 'data',
    name: TelemetryEvents.httpStart(req.method),
    payload: {
      method: req.method,
      url,
      hasBody: req.body !== null && req.body !== undefined,
    },
  });

  return next(req).pipe(
    tap({
      next: (event) => {
        if (event instanceof HttpResponse) {
          const elapsed = Math.round(performance.now() - startTime);
          eventBus.emit({
            source: 'http',
            category: 'data',
            name: TelemetryEvents.httpSuccess(req.method),
            durationMs: elapsed,
            payload: {
              status: event.status,
              statusText: event.statusText,
              url,
              elapsedMs: elapsed,
            },
          });
        }
      },
      error: (err: unknown) => {
        const elapsed = Math.round(performance.now() - startTime);
        const status = err instanceof HttpErrorResponse ? err.status : 0;
        const message = err instanceof Error ? err.message : 'Network error';

        eventBus.emit({
          source: 'http',
          category: 'error',
          name: TelemetryEvents.httpError(req.method),
          durationMs: elapsed,
          payload: {
            status,
            message,
            url,
            elapsedMs: elapsed,
          },
        });
      },
    })
  );
};
