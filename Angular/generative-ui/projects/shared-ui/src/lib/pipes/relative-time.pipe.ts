import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'uiRelativeTime',
  standalone: true,
})
export class UiRelativeTimePipe implements PipeTransform {
  transform(value: string | Date | number | null | undefined): string {
    if (!value) return '';

    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) return '';

    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 0) {
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }

    if (diffSeconds < 60) {
      return 'just now';
    }

    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    }

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
      return `${diffHours}h ago`;
    }

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) {
      return 'yesterday';
    }

    if (diffDays < 7) {
      return `${diffDays}d ago`;
    }

    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
}
