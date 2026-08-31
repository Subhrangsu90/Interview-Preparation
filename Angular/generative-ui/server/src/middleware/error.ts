import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express';

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('[Unhandled Server Error]:', err);

  const isProduction = process.env['NODE_ENV'] === 'production';

  res.status(500).json({
    status: 'error',
    message: isProduction ? 'Internal server error' : err.message || 'Something went wrong',
    ...(isProduction ? {} : { stack: err.stack }),
  });
};
