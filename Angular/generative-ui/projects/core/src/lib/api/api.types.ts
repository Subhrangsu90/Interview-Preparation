import { HttpHeaders, HttpParams } from '@angular/common/http';

export type HttpParamValue = string | number | boolean | readonly (string | number | boolean)[];
export type HttpParamsRecord = Record<string, HttpParamValue | null | undefined>;

export interface RequestOptions {
  /**
   * Query parameters. Undefined, null, and empty string values are automatically omitted.
   */
  params?: HttpParamsRecord | HttpParams;

  /**
   * Custom request headers.
   */
  headers?: Record<string, string | string[]> | HttpHeaders;

  /**
   * If true and the response is enveloped as `{ data: T }`,
   * automatically unwraps and returns `response.data`.
   * Defaults to false.
   */
  unwrapEnvelope?: boolean;

  /**
   * Override base URL for this specific request.
   */
  baseUrl?: string;

  /**
   * Report upload/download progress events.
   */
  reportProgress?: boolean;

  /**
   * Send credentials (cookies) with cross-site requests.
   */
  withCredentials?: boolean;
}

export interface ApiResponseEnvelope<T> {
  success?: boolean;
  data?: T;
  message?: string;
  error?: unknown;
}
