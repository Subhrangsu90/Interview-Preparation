import { Injectable, inject, signal } from '@angular/core';
import {
  LOG_APPENDERS,
  LOG_FORMATTER,
  LogAppender,
  LogEntry,
  LogFormatter,
  LogFormatFn,
  LogLevel,
  LoggerConfig,
} from './logger.types';

@Injectable()
export class LoggerService {
  private readonly config = inject(LoggerConfig);
  private readonly formatter = inject(LOG_FORMATTER);
  private readonly appenders = inject(LOG_APPENDERS, { optional: true }) ?? [];

  // Hierarchical Service Chaining: inject parent logger if present in ancestor injector
  private readonly parentLogger = inject(LoggerService, {
    optional: true,
    skipSelf: true,
  });

  // Category-specific appenders registry (populated via Configuration Provider Factory)
  readonly categories = new Map<string, LogAppender>();

  // Reactive signal stream for modern Angular UI inspection/debugging
  readonly lastLog = signal<LogEntry | null>(null);

  debug(category: string, message: string, ...context: unknown[]): void {
    this.log(LogLevel.DEBUG, category, message, ...context);
  }

  info(category: string, message: string, ...context: unknown[]): void {
    this.log(LogLevel.INFO, category, message, ...context);
  }

  warn(category: string, message: string, ...context: unknown[]): void {
    this.log(LogLevel.WARN, category, message, ...context);
  }

  error(category: string, message: string, ...context: unknown[]): void {
    this.log(LogLevel.ERROR, category, message, ...context);
  }

  log(level: LogLevel, category: string, message: string, ...context: unknown[]): void {
    // 1. Check minimum log level
    if (level < this.config.level) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      category,
      message,
      context,
    };

    // 2. Update reactive signal
    this.lastLog.set(entry);

    // 3. Format message (supporting both functional and class-based formatters)
    const formatted = this.format(entry);

    // 4. Delegate to category-specific appender if registered
    const catAppender = this.categories.get(category.toLowerCase());
    if (catAppender) {
      catAppender.append(entry, formatted);
    }

    // 5. Delegate to registered multi-provider appenders
    for (const appender of this.appenders) {
      appender.append(entry, formatted);
    }

    // 6. Service Chain: Forward up to ancestor logger if chaining is enabled
    if (this.config.chaining && this.parentLogger) {
      this.parentLogger.log(level, category, message, ...context);
    }
  }

  private format(entry: LogEntry): string {
    if (this.formatter && typeof (this.formatter as LogFormatter).format === 'function') {
      return (this.formatter as LogFormatter).format(entry);
    }
    if (typeof this.formatter === 'function') {
      return (this.formatter as LogFormatFn)(entry);
    }
    return entry.message;
  }
}
