/**
 * Standardized API Error class capturing status code, details, and message.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly details: unknown;
  readonly rawError: unknown;

  constructor(message: string, status = 0, details: unknown = null, rawError: unknown = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
    this.rawError = rawError;

    // Restore prototype chain for instanceof checks in compiled JS
    Object.setPrototypeOf(this, new.target.prototype);
  }

  /**
   * Whether this error indicates a client error (4xx)
   */
  get isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  /**
   * Whether this error indicates a server error (5xx)
   */
  get isServerError(): boolean {
    return this.status >= 500 && this.status < 600;
  }

  /**
   * Whether this error is a network or offline error (status 0)
   */
  get isNetworkError(): boolean {
    return this.status === 0;
  }
}
