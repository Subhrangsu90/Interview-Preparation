import { Injectable, inject } from '@angular/core';
import { LoggerFeature, LoggerFeatureKind, LogLevel } from '../logger.types';

export abstract class ColorConfig {
  abstract debug: string;
  abstract info: string;
  abstract warn: string;
  abstract error: string;
}

export const DEFAULT_COLOR_CONFIG: ColorConfig = {
  debug: '#6c757d', // Gray
  info: '#0d6efd',  // Blue
  warn: '#ffc107',  // Amber
  error: '#dc3545', // Red
};

@Injectable()
export class ColorService {
  private readonly config = inject(ColorConfig, { optional: true }) ?? DEFAULT_COLOR_CONFIG;

  getColor(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG:
        return this.config.debug;
      case LogLevel.INFO:
        return this.config.info;
      case LogLevel.WARN:
        return this.config.warn;
      case LogLevel.ERROR:
        return this.config.error;
      default:
        return '#000000';
    }
  }

  getStyle(level: LogLevel): string {
    const color = this.getColor(level);
    return `color: ${color}; font-weight: bold;`;
  }
}

/**
 * Feature: withColor
 * Enables styled console output with customizable level colors.
 */
export function withColor(config?: Partial<ColorConfig>): LoggerFeature {
  const merged: ColorConfig = { ...DEFAULT_COLOR_CONFIG, ...config };

  return {
    kind: LoggerFeatureKind.COLOR,
    providers: [
      { provide: ColorConfig, useValue: merged },
      { provide: ColorService, useClass: ColorService },
    ],
  };
}
