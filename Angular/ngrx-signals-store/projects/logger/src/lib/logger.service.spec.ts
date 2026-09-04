import { TestBed } from '@angular/core/testing';
import {
  provideLogger,
  provideLoggerCategory,
  LoggerService,
  LogLevel,
  LogAppender,
  LogEntry,
  withColor,
  withPrefix,
} from './index';

describe('Standalone Logger API', () => {
  describe('Provider Factory & Basic Logging', () => {
    it('should provide LoggerService with default configuration', () => {
      TestBed.configureTestingModule({
        providers: [provideLogger()],
      });

      const logger = TestBed.inject(LoggerService);
      expect(logger).toBeTruthy();
      expect(logger.lastLog()).toBeNull();

      logger.info('TestCat', 'Hello World');
      const entry = logger.lastLog();
      expect(entry).toBeTruthy();
      expect(entry?.category).toBe('TestCat');
      expect(entry?.message).toBe('Hello World');
      expect(entry?.level).toBe(LogLevel.INFO);
    });

    it('should respect minimum log level configuration', () => {
      TestBed.configureTestingModule({
        providers: [provideLogger({ level: LogLevel.WARN })],
      });

      const logger = TestBed.inject(LoggerService);
      logger.debug('Test', 'Should not log debug');
      logger.info('Test', 'Should not log info');
      expect(logger.lastLog()).toBeNull();

      logger.warn('Test', 'Should log warn');
      expect(logger.lastLog()?.level).toBe(LogLevel.WARN);
    });

    it('should support functional formatter (Functional Service Pattern)', () => {
      const customFn = (entry: LogEntry) => `CUSTOM:[${entry.category}]:${entry.message}`;

      TestBed.configureTestingModule({
        providers: [
          provideLogger({
            formatter: customFn,
          }),
        ],
      });

      const logger = TestBed.inject(LoggerService);
      logger.info('Auth', 'Token refreshed');
      expect(logger.lastLog()?.message).toBe('Token refreshed');
    });
  });

  describe('Feature Pattern (withColor & withPrefix)', () => {
    it('should configure color and prefix features without errors', () => {
      TestBed.configureTestingModule({
        providers: [
          provideLogger(
            { level: LogLevel.DEBUG },
            withColor({ info: '#123456' }),
            withPrefix('[UnitTest]')
          ),
        ],
      });

      const logger = TestBed.inject(LoggerService);
      expect(logger).toBeTruthy();
      logger.info('Order', 'Created successfully');
      expect(logger.lastLog()?.message).toBe('Created successfully');
    });

    it('should reject duplicate features of the same kind', () => {
      expect(() => {
        provideLogger(
          {},
          withColor(),
          withColor() // Duplicate!
        );
      }).toThrowError(/Duplicate feature registered for kind 'COLOR'/);
    });
  });

  describe('Configuration Provider Factory (provideLoggerCategory)', () => {
    it('should register category-specific appenders via ENVIRONMENT_INITIALIZER', () => {
      const recorded: string[] = [];

      class AuditAppender implements LogAppender {
        append(entry: LogEntry, formatted: string): void {
          recorded.push(`AUDIT:${entry.message}`);
        }
      }

      TestBed.configureTestingModule({
        providers: [
          provideLogger(),
          provideLoggerCategory('security', AuditAppender),
        ],
      });

      const logger = TestBed.inject(LoggerService);
      logger.info('general', 'Normal message');
      expect(recorded.length).toBe(0);

      logger.info('security', 'Unauthorized access attempt');
      expect(recorded.length).toBe(1);
      expect(recorded[0]).toBe('AUDIT:Unauthorized access attempt');
    });
  });
});
