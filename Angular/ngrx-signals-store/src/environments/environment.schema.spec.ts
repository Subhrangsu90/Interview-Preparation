import { LogLevel } from 'logger';
import { validateEnvironment } from './environment.schema';

describe('Environment Zod Schema Validation', () => {
  it('should successfully validate a well-formed environment configuration', () => {
    const validConfig = {
      production: true,
      apiUrl: 'https://api.store.com/v1',
      logLevel: LogLevel.INFO,
      enableColorLogs: false,
    };

    const validated = validateEnvironment(validConfig);
    expect(validated).toEqual(validConfig);
  });

  it('should throw when apiUrl is not a valid URL', () => {
    const invalidConfig = {
      production: false,
      apiUrl: 'not-a-valid-url',
      logLevel: LogLevel.DEBUG,
      enableColorLogs: true,
    };

    expect(() => validateEnvironment(invalidConfig)).toThrowError(
      /apiUrl must be a valid URL/
    );
  });

  it('should throw when logLevel is invalid', () => {
    const invalidConfig = {
      production: false,
      apiUrl: 'https://api.test.com',
      logLevel: 999, // Invalid level
      enableColorLogs: true,
    };

    expect(() => validateEnvironment(invalidConfig)).toThrowError(
      /Environment Validation Failed/
    );
  });

  it('should throw when required properties are missing', () => {
    const missingPropsConfig = {
      production: true,
    };

    expect(() => validateEnvironment(missingPropsConfig)).toThrowError(
      /Environment Validation Failed/
    );
  });
});
