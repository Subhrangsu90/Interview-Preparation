import { InjectionToken, Provider, Type } from '@angular/core';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export const LOG_LEVEL_NAMES: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.INFO]: 'INFO',
  [LogLevel.WARN]: 'WARN',
  [LogLevel.ERROR]: 'ERROR',
};

export interface LogEntry {
  readonly timestamp: Date;
  readonly level: LogLevel;
  readonly category: string;
  readonly message: string;
  readonly context?: unknown[];
}

export abstract class LogFormatter {
  abstract format(entry: LogEntry): string;
}

export type LogFormatFn = (entry: LogEntry) => string;

export abstract class LogAppender {
  abstract append(entry: LogEntry, formattedMessage: string): void;
}

export abstract class LoggerConfig {
  abstract level: LogLevel;
  abstract formatter: Type<LogFormatter> | LogFormatFn;
  abstract appenders: Type<LogAppender>[];
  abstract chaining?: boolean;
}

export const LOG_APPENDERS = new InjectionToken<LogAppender[]>('LOG_APPENDERS');
export const LOG_FORMATTER = new InjectionToken<LogFormatter | LogFormatFn>('LOG_FORMATTER');

export enum LoggerFeatureKind {
  COLOR = 'COLOR',
  PREFIX = 'PREFIX',
  CUSTOM = 'CUSTOM',
}

export interface LoggerFeature {
  readonly kind: LoggerFeatureKind;
  readonly providers: Provider[];
}
