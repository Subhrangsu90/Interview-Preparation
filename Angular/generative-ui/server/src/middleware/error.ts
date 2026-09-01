import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express';

interface ErrorWithDetails extends Error {
  code?: string;
  errno?: number;
  routine?: string;
  errors?: unknown[];
}

/**
 * Determines if an error originated from a database connection, network failure,
 * or database server outage/misconfiguration.
 */
export function isDatabaseError(err: unknown): err is ErrorWithDetails {
  if (!err || typeof err !== 'object') return false;

  const candidate = err as ErrorWithDetails;

  // 1. Node.js networking & system error codes
  const networkCodes = new Set([
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ENOTFOUND',
    'EHOSTUNREACH',
    'ECONNRESET',
    'EPIPE',
    'ERR_SOCKET_CONNECTION_TIMEOUT',
  ]);

  if (candidate.code && networkCodes.has(candidate.code)) {
    return true;
  }

  // 2. PostgreSQL SQLSTATE error codes
  // - Class 08: Connection Exception (e.g. 08000, 08001, 08003, 08004, 08006, 08007, 08P01)
  // - Class 28: Invalid Authorization Specification (e.g. 28000, 28P01)
  // - Class 3D: Invalid Catalog Name (e.g. 3D000 - database does not exist)
  // - Class 57: Operator Intervention (e.g. 57P01 admin shutdown, 57P02 crash, 57P03 cannot connect now)
  if (
    typeof candidate.code === 'string' &&
    (candidate.code.startsWith('08') ||
      candidate.code.startsWith('28') ||
      candidate.code.startsWith('3D') ||
      candidate.code.startsWith('57'))
  ) {
    return true;
  }

  // 3. Node 18+ AggregateError (e.g. IPv6 ::1 failure followed by IPv4 127.0.0.1 failure)
  if (Array.isArray(candidate.errors) && candidate.errors.some(isDatabaseError)) {
    return true;
  }

  // 4. Typical PostgreSQL / network error messages
  const message = candidate.message || '';
  const dbErrorPatterns = [
    /ECONNREFUSED/i,
    /ETIMEDOUT/i,
    /ENOTFOUND/i,
    /connection terminated unexpectedly/i,
    /Connection terminated/i,
    /terminating connection due to administrator command/i,
    /server closed the connection unexpectedly/i,
    /password authentication failed/i,
    /database ".*" does not exist/i,
    /role ".*" does not exist/i,
    /timeout exceeded when connecting to database/i,
  ];

  return dbErrorPatterns.some((pattern) => pattern.test(message));
}

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const isProduction = process.env['NODE_ENV'] === 'production';

  if (isDatabaseError(err)) {
    console.error(
      '❌ [Database Connection Error]:',
      err.message,
      err.code ? `(Code: ${err.code})` : ''
    );

    const isAuthConfigError =
      typeof err.code === 'string' && (err.code.startsWith('28') || err.code.startsWith('3D'));

    const statusCode = isAuthConfigError ? 500 : 503;
    const errorCode = isAuthConfigError ? 'DB_CONFIG_ERROR' : 'DB_CONNECTION_ERROR';
    const userMessage = isAuthConfigError
      ? 'Database authentication or configuration error. Please verify connection credentials.'
      : 'Database service is currently unavailable. Please ensure PostgreSQL is running and accessible.';

    res.status(statusCode).json({
      status: 'error',
      code: errorCode,
      message: userMessage,
      ...(isProduction
        ? {}
        : {
            detail: err.message,
            code: err.code,
            hint: isAuthConfigError
              ? 'Check DATABASE_URL credentials and database name in .env'
              : 'Ensure the PostgreSQL container or service is started (e.g. npm run docker:up)',
            stack: err.stack,
          }),
    });
    return;
  }

  console.error('[Unhandled Server Error]:', err);

  res.status(500).json({
    status: 'error',
    message: isProduction ? 'Internal server error' : err.message || 'Something went wrong',
    ...(isProduction ? {} : { stack: err.stack }),
  });
};
