import {
  EnvironmentProviders,
  ENVIRONMENT_INITIALIZER,
  InjectionToken,
  makeEnvironmentProviders,
  Provider,
  Type,
  inject,
} from '@angular/core';
import {
  LOG_APPENDERS,
  LOG_FORMATTER,
  LogAppender,
  LogFormatter,
  LogLevel,
  LoggerConfig,
  LoggerFeature,
  LoggerFeatureKind,
} from './logger.types';
import { DefaultLogFormatter } from './formatters/default.formatter';
import { ConsoleLogAppender } from './appenders/console.appender';
import { LoggerService } from './logger.service';

/**
 * Checks if a target is a class implementing LogFormatter rather than a pure functional LogFormatFn.
 */
export function isFormatterClass(target: unknown): target is Type<LogFormatter> {
  if (typeof target !== 'function') {
    return false;
  }
  const proto = (target as { prototype?: { format?: unknown } }).prototype;
  return proto != null && typeof proto.format === 'function';
}

export const DEFAULT_LOGGER_CONFIG: LoggerConfig = {
  level: LogLevel.DEBUG,
  formatter: DefaultLogFormatter,
  appenders: [ConsoleLogAppender],
  chaining: false,
};

/**
 * Standalone Provider Factory for configuring the Logger library.
 *
 * @param config Partial configuration options (merged with defaults)
 * @param features Optional, tree-shakable features (e.g., withColor, withPrefix)
 */
export function provideLogger(
  config?: Partial<LoggerConfig>,
  ...features: LoggerFeature[]
): EnvironmentProviders {
  const merged: LoggerConfig = { ...DEFAULT_LOGGER_CONFIG, ...config };

  // Feature Validation: Prevent duplicate feature kinds
  const featureKinds = new Set<LoggerFeatureKind>();
  for (const feature of features) {
    if (featureKinds.has(feature.kind)) {
      throw new Error(
        `[provideLogger] Duplicate feature registered for kind '${feature.kind}'. Only one is allowed.`
      );
    }
    featureKinds.add(feature.kind);
  }

  const baseProviders: Provider[] = [
    LoggerService,
    {
      provide: LoggerConfig,
      useValue: merged,
    },
    // Functional vs Class-based LogFormatter registration
    isFormatterClass(merged.formatter)
      ? {
          provide: LOG_FORMATTER,
          useClass: merged.formatter,
        }
      : {
          provide: LOG_FORMATTER,
          useValue: merged.formatter,
        },
    // Multi-provider for LogAppenders
    ...merged.appenders.map((appender) => ({
      provide: LOG_APPENDERS,
      useClass: appender,
      multi: true,
    })),
    // Flattened feature providers
    ...features.flatMap((f) => f.providers),
  ];

  return makeEnvironmentProviders(baseProviders);
}

/**
 * Standalone Configuration Provider Factory for registering category-specific appenders.
 *
 * Typically used in child/lazy route scopes to customize behavior for a specific category.
 *
 * @param category The logging category to attach the appender to
 * @param appender The LogAppender class to instantiate
 */
export function provideLoggerCategory(
  category: string,
  appender: Type<LogAppender>
): EnvironmentProviders {
  const normalizedCategory = category.toLowerCase();
  const appenderToken = new InjectionToken<LogAppender>(`LOGGER_APPENDER_${normalizedCategory}`);

  return makeEnvironmentProviders([
    {
      provide: appenderToken,
      useClass: appender,
    },
    {
      provide: ENVIRONMENT_INITIALIZER,
      multi: true,
      useValue: () => {
        const appenderInstance = inject(appenderToken);
        const logger = inject(LoggerService);
        logger.categories.set(normalizedCategory, appenderInstance);
      },
    },
  ]);
}
