import { Component, computed, input } from '@angular/core';

export type StatusBadgeVariant = 'auto' | 'primary' | 'tertiary' | 'success' | 'warning' | 'info' | 'danger' | 'neutral';

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

      &.primary,
      &.info {
        background-color: var(--mat-sys-primary-container);
        color: var(--mat-sys-on-primary-container);
        border: 1px solid transparent;
      }

      &.tertiary {
        background-color: var(--mat-sys-tertiary-container);
        color: var(--mat-sys-on-tertiary-container);
        border: 1px solid transparent;
      }

      &.success {
        background-color: #ecfdf5;
        color: #059669;
        border: 1px solid transparent;
      }

      &.warning {
        background-color: #fef3c7;
        color: #d97706;
        border: 1px solid transparent;
      }

      &.danger {
        background-color: #fef2f2;
        color: #dc2626;
        border: 1px solid transparent;
      }

      &.neutral {
        background-color: var(--mat-sys-surface-container);
        color: var(--mat-sys-on-surface-variant);
        border: 1px solid transparent;
      }

      :host-context(.dark-theme) & {
        &.primary,
        &.info {
          background-color: var(--mat-sys-primary-container);
          color: var(--mat-sys-on-primary-container);
          border-color: var(--mat-sys-outline-variant);
        }

        &.tertiary {
          background-color: var(--mat-sys-tertiary-container);
          color: var(--mat-sys-on-tertiary-container);
          border-color: var(--mat-sys-outline-variant);
        }

        &.success {
          background-color: rgba(16, 185, 129, 0.16);
          color: #34d399;
          border-color: rgba(16, 185, 129, 0.3);
        }

        &.warning {
          background-color: rgba(245, 158, 11, 0.16);
          color: #fbbf24;
          border-color: rgba(245, 158, 11, 0.3);
        }

        &.danger {
          background-color: rgba(239, 68, 68, 0.16);
          color: #f87171;
          border-color: rgba(239, 68, 68, 0.3);
        }

        &.neutral {
          background-color: var(--mat-sys-surface-container);
          color: var(--mat-sys-on-surface-variant);
          border-color: var(--mat-sys-outline-variant);
        }
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
