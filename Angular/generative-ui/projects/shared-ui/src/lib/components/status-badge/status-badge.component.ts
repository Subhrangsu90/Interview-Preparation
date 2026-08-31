import { Component, computed, input } from '@angular/core';

export type StatusBadgeVariant = 'auto' | 'success' | 'warning' | 'info' | 'danger' | 'neutral';

export type StatusBadgeSize = 'sm' | 'md';

@Component({
  selector: 'ui-status-badge',
  standalone: true,
  template: `
    <span
      class="ui-status-badge"
      [class]="badgeVariant()"
      [class.size-sm]="size() === 'sm'"
      [class.size-md]="size() === 'md'"
    >
      @if (showDot()) {
        <span class="ui-status-dot"></span>
      }
      <span class="ui-status-text">{{ displayLabel() }}</span>
    </span>
  `,
  styles: `
    .ui-status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-weight: 600;
      border-radius: 9999px;
      line-height: 1;
      width: fit-content;
      transition:
        background-color 0.2s ease,
        color 0.2s ease;

      &.size-md {
        padding: 6px 12px;
        font-size: 0.8125rem;

        .ui-status-dot {
          width: 7px;
          height: 7px;
        }
      }

      &.size-sm {
        padding: 4px 8px;
        font-size: 0.75rem;

        .ui-status-dot {
          width: 6px;
          height: 6px;
        }
      }

      .ui-status-dot {
        border-radius: 50%;
        background-color: currentColor;
        flex-shrink: 0;
      }

      &.success {
        background-color: #ecfdf5;
        color: #059669;
      }

      &.warning {
        background-color: #fef3c7;
        color: #d97706;
      }

      &.info {
        background-color: #eff6ff;
        color: #2563eb;
      }

      &.danger {
        background-color: #fef2f2;
        color: #dc2626;
      }

      &.neutral {
        background-color: #f1f5f9;
        color: #64748b;
      }
    }
  `,
})
export class UiStatusBadge {
  readonly status = input.required<string>();
  readonly label = input<string | null>(null);
  readonly variant = input<StatusBadgeVariant>('auto');
  readonly showDot = input<boolean>(true);
  readonly size = input<StatusBadgeSize>('md');

  readonly badgeVariant = computed<string>(() => {
    const explicit = this.variant();
    if (explicit !== 'auto') {
      return explicit;
    }

    const s = (this.status() || '').toLowerCase().trim();
    switch (s) {
      case 'delivered':
      case 'resolved':
      case 'completed':
      case 'active':
      case 'success':
        return 'success';

      case 'pending':
      case 'processing':
      case 'in_progress':
      case 'progress':
      case 'waiting':
        return 'warning';

      case 'shipped':
      case 'in_transit':
      case 'in-transit':
      case 'open':
      case 'return_requested':
      case 'return':
        return 'info';

      case 'cancelled':
      case 'canceled':
      case 'closed':
      case 'rejected':
      case 'failed':
      case 'danger':
        return 'danger';

      default:
        return 'neutral';
    }
  });

  readonly displayLabel = computed<string>(() => {
    const custom = this.label();
    if (custom) return custom;

    const raw = this.status() || '';
    return raw
      .split(/[-_]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  });
}
