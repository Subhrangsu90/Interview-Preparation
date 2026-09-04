import { LogLevel } from 'logger';
import { validateEnvironment } from './environment.schema';

export const environment = validateEnvironment({
  production: false,
  apiUrl: 'http://localhost:3000',
  logLevel: LogLevel.DEBUG,
  enableColorLogs: true,
});
