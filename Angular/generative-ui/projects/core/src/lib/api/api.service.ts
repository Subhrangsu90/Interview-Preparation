import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { API_BASE_URL } from './api.tokens';
import { ApiError } from './api-error.model';
import { HttpParamsRecord, RequestOptions } from './api.types';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly defaultBaseUrl = inject(API_BASE_URL, { optional: true }) ?? '/api';

  /**
   * Performs an HTTP GET request.
   */
  get<T>(endpoint: string, options?: RequestOptions): Observable<T> {
    const url = this.resolveUrl(endpoint, options?.baseUrl);
    const httpOptions = this.buildHttpOptions(options);

    return this.pipeRequest(this.http.get<T>(url, httpOptions), options?.unwrapEnvelope);
  }

  /**
   * Performs an HTTP POST request.
   */
  post<T, B = unknown>(endpoint: string, body?: B, options?: RequestOptions): Observable<T> {
    const url = this.resolveUrl(endpoint, options?.baseUrl);
    const httpOptions = this.buildHttpOptions(options);

    return this.pipeRequest(
      this.http.post<T>(url, body ?? null, httpOptions),
      options?.unwrapEnvelope
    );
  }

  /**
   * Performs an HTTP PUT request.
   */
  put<T, B = unknown>(endpoint: string, body?: B, options?: RequestOptions): Observable<T> {
    const url = this.resolveUrl(endpoint, options?.baseUrl);
    const httpOptions = this.buildHttpOptions(options);

    return this.pipeRequest(
      this.http.put<T>(url, body ?? null, httpOptions),
      options?.unwrapEnvelope
    );
  }

  /**
   * Performs an HTTP PATCH request.
   */
  patch<T, B = unknown>(endpoint: string, body?: B, options?: RequestOptions): Observable<T> {
    const url = this.resolveUrl(endpoint, options?.baseUrl);
    const httpOptions = this.buildHttpOptions(options);

    return this.pipeRequest(
      this.http.patch<T>(url, body ?? null, httpOptions),
      options?.unwrapEnvelope
    );
  }

  /**
   * Performs an HTTP DELETE request.
   */
  delete<T>(endpoint: string, options?: RequestOptions): Observable<T> {
    const url = this.resolveUrl(endpoint, options?.baseUrl);
    const httpOptions = this.buildHttpOptions(options);

    return this.pipeRequest(this.http.delete<T>(url, httpOptions), options?.unwrapEnvelope);
  }

  /**
   * Constructs the full URL by combining base URL and endpoint, avoiding duplicate slashes.
   */
  resolveUrl(endpoint: string, baseUrlOverride?: string): string {
    // If endpoint is an absolute URL, use it directly
    if (/^https?:\/\//i.test(endpoint)) {
      return endpoint;
    }

    const base = (baseUrlOverride ?? this.defaultBaseUrl).replace(/\/+$/, '');
    const path = endpoint.replace(/^\/+/, '');

    if (!base) return `/${path}`;
    if (!path) return base;
    return `${base}/${path}`;
  }

  /**
   * Formats HTTP query parameters, automatically filtering out null, undefined, and empty strings.
   */
  buildParams(params?: HttpParamsRecord | HttpParams): HttpParams {
    if (!params) {
      return new HttpParams();
    }

    if (params instanceof HttpParams) {
      return params;
    }

    let httpParams = new HttpParams();

    for (const [key, value] of Object.entries(params)) {
      if (value === null || value === undefined || value === '') {
        continue;
      }

      if (Array.isArray(value)) {
        for (const item of value) {
          if (item !== null && item !== undefined && item !== '') {
            httpParams = httpParams.append(key, String(item));
          }
        }
      } else {
        httpParams = httpParams.set(key, String(value));
      }
    }

    return httpParams;
  }

  private buildHttpOptions(options?: RequestOptions): {
    headers?: HttpHeaders;
    params?: HttpParams;
    withCredentials?: boolean;
    reportProgress?: boolean;
  } {
    const httpOptions: {
      headers?: HttpHeaders;
      params?: HttpParams;
      withCredentials?: boolean;
      reportProgress?: boolean;
    } = {};

    if (options?.params) {
      httpOptions.params = this.buildParams(options.params);
    }

    if (options?.headers) {
      httpOptions.headers =
        options.headers instanceof HttpHeaders ? options.headers : new HttpHeaders(options.headers);
    }

    if (options?.withCredentials !== undefined) {
      httpOptions.withCredentials = options.withCredentials;
    }

    if (options?.reportProgress !== undefined) {
      httpOptions.reportProgress = options.reportProgress;
    }

    return httpOptions;
  }

  private pipeRequest<T>(source: Observable<T>, unwrapEnvelope = false): Observable<T> {
    return source.pipe(
      map((res: T) => {
        if (
          unwrapEnvelope &&
          res &&
          typeof res === 'object' &&
          'data' in (res as Record<string, unknown>)
        ) {
          return (res as Record<string, unknown>)['data'] as T;
        }
        return res;
      }),
      catchError((err: unknown) => {
        if (err instanceof HttpErrorResponse) {
          const message =
            err.error?.message ||
            err.error?.error ||
            err.message ||
            `HTTP ${err.status} ${err.statusText}`;

          return throwError(() => new ApiError(message, err.status, err.error, err));
        }

        if (err instanceof ApiError) {
          return throwError(() => err);
        }

        const fallbackMsg = err instanceof Error ? err.message : 'Unknown API error occurred';
        return throwError(() => new ApiError(fallbackMsg, 0, null, err));
      })
    );
  }
}
