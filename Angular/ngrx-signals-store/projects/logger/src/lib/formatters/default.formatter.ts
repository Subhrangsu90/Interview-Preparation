import { Injectable } from '@angular/core';
import { LogEntry, LogFormatter, LOG_LEVEL_NAMES } from '../logger.types';

@Injectable()
export class DefaultLogFormatter implements LogFormatter {
  format(entry: LogEntry): string {
    const time = entry.timestamp.toTimeString().split(' ')[0] + '.' + 
      entry.timestamp.getMilliseconds().toString().padStart(3, '0');
    const levelStr = LOG_LEVEL_NAMES[entry.level].padEnd(5);
    const categoryStr = `[${entry.category.toUpperCase()}]`;

    return `[${time}] [${levelStr}] ${categoryStr} ${entry.message}`;
  }
}
