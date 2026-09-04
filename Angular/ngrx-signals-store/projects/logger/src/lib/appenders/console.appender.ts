import { Injectable, inject } from '@angular/core';
import { LogAppender, LogEntry, LogLevel } from '../logger.types';
import { ColorService } from '../features/color.feature';
import { PrefixService } from '../features/prefix.feature';

@Injectable()
export class ConsoleLogAppender implements LogAppender {
  private readonly colorService = inject(ColorService, { optional: true });
  private readonly prefixService = inject(PrefixService, { optional: true });

  append(entry: LogEntry, formattedMessage: string): void {
    let finalMessage = formattedMessage;

    if (this.prefixService) {
      finalMessage = this.prefixService.format(finalMessage);
    }

    const context = entry.context && entry.context.length > 0 ? entry.context : [];

    // Browser styling via %c if ColorService is configured
    if (this.colorService && typeof window !== 'undefined') {
      const style = this.colorService.getStyle(entry.level);
      this.writeConsole(entry.level, `%c${finalMessage}`, [style, ...context]);
    } else {
      this.writeConsole(entry.level, finalMessage, context);
    }
  }

  private writeConsole(level: LogLevel, message: string, context: unknown[]): void {
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(message, ...context);
        break;
      case LogLevel.INFO:
        console.info(message, ...context);
        break;
      case LogLevel.WARN:
        console.warn(message, ...context);
        break;
      case LogLevel.ERROR:
        console.error(message, ...context);
        break;
    }
  }
}
