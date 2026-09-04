import { LogLevel } from 'logger';
import { validateEnvironment } from './environment.schema';

export const environment = validateEnvironment({
  production: true,
  apiUrl: 'https://api.example.com',
  logLevel: LogLevel.WARN,
  enableColorLogs: false,
});
