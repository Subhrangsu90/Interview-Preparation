import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

export type MetricCardVariant = 'blue' | 'amber' | 'purple' | 'emerald' | 'rose' | 'slate';

export interface MetricTrend {
  value: string;
  direction: 'up' | 'down' | 'neutral';
}

@Component({
  selector: 'ui-metric-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <mat-card appearance="outlined" class="ui-metric-card" [class.clickable]="clickable()">
      <div class="ui-metric-icon-box" [class]="variant()">
        <mat-icon>{{ icon() }}</mat-icon>
      </div>
      <div class="ui-metric-content">
        <div class="ui-metric-value-row">
          <span class="ui-metric-value">{{ value() }}</span>
          @if (trend(); as tr) {
            <span class="ui-metric-trend" [class]="tr.direction">
              <mat-icon class="trend-icon">
                {{
                  tr.direction === 'up'
                    ? 'trending_up'
                    : tr.direction === 'down'
                      ? 'trending_down'
                      : 'trending_flat'
                }}
              </mat-icon>
              <span>{{ tr.value }}</span>
            </span>
          }
        </div>
        <span class="ui-metric-label">{{ label() }}</span>
      </div>
    </mat-card>
  `,
  styles: `
    .ui-metric-card {
      padding: 16px;
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 16px;
      border-radius: 12px;
      border-color: var(--mat-sys-outline-variant, #e2e8f0);
      background-color: var(--mat-sys-surface, #ffffff);
      transition:
        transform 0.2s cubic-bezier(0.4, 0, 0.2, 1),
        box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        box-shadow: 0 6px 16px -2px rgba(0, 0, 0, 0.08);
      }

      &.clickable {
        cursor: pointer;
        &:hover {
          transform: translateY(-2px);
        }
      }
    }

    .ui-metric-icon-box {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      &.blue {
        background: #eff6ff;
        color: #2563eb;
      }
      &.amber {
        background: #fef3c7;
        color: #d97706;
      }
      &.purple {
        background: #ede9fe;
        color: #7c3aed;
      }
      &.emerald {
        background: #ecfdf5;
        color: #059669;
      }
      &.rose {
        background: #ffe4e6;
        color: #e11d48;
      }
      &.slate {
        background: #f1f5f9;
        color: #475569;
      }

      mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }
    }

    .ui-metric-content {
      display: flex;
      flex-direction: column;
      min-width: 0;
      gap: 2px;
    }

    .ui-metric-value-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .ui-metric-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--mat-sys-on-surface, #0f172a);
      line-height: 1.2;
    }

    .ui-metric-trend {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 12px;

      .trend-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
      }

      &.up {
        background: #ecfdf5;
        color: #059669;
      }
      &.down {
        background: #fef2f2;
        color: #dc2626;
      }
      &.neutral {
        background: #f1f5f9;
        color: #64748b;
      }
    }

    .ui-metric-label {
      font-size: 0.85rem;
      color: var(--mat-sys-on-surface-variant, #64748b);
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `,
})
export class UiMetricCard {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly icon = input.required<string>();
  readonly variant = input<MetricCardVariant>('blue');
  readonly clickable = input<boolean>(false);
  readonly trend = input<MetricTrend | null>(null);
}
