import { Injectable, inject } from '@angular/core';
import { LoggerFeature, LoggerFeatureKind } from '../logger.types';

export abstract class PrefixConfig {
  abstract prefix: string;
}

@Injectable()
export class PrefixService {
  private readonly config = inject(PrefixConfig, { optional: true });

  format(message: string): string {
    if (!this.config?.prefix) {
      return message;
    }
    return `${this.config.prefix} ${message}`;
  }
}

/**
 * Feature: withPrefix
 * Automatically prepends a global tag/prefix (e.g. '[MyApp]') to formatted log messages.
 */
export function withPrefix(prefix: string): LoggerFeature {
  return {
    kind: LoggerFeatureKind.PREFIX,
    providers: [
      { provide: PrefixConfig, useValue: { prefix } },
      { provide: PrefixService, useClass: PrefixService },
    ],
  };
}
