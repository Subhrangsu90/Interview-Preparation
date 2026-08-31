import { Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'ui-empty-state',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  template: `
    <div class="ui-empty-state">
      <div class="ui-empty-icon-wrap">
        <mat-icon class="ui-empty-icon">{{ icon() }}</mat-icon>
      </div>
      <h3 class="ui-empty-title">{{ title() }}</h3>
      @if (description()) {
        <p class="ui-empty-description">{{ description() }}</p>
      }
      <div class="ui-empty-actions">
        @if (actionLabel()) {
          <button mat-stroked-button (click)="actionClick.emit()">
            @if (actionIcon()) {
              <mat-icon>{{ actionIcon() }}</mat-icon>
            }
            {{ actionLabel() }}
          </button>
        }
        <ng-content select="[custom-action]" />
        <ng-content />
      </div>
    </div>
  `,
  styles: `
    .ui-empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      text-align: center;
    }

    .ui-empty-icon-wrap {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: var(--mat-sys-surface-container-high, #f1f5f9);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
    }

    .ui-empty-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: var(--mat-sys-on-surface-variant, #94a3b8);
    }

    .ui-empty-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--mat-sys-on-surface, #1e293b);
      margin: 0 0 8px 0;
    }

    .ui-empty-description {
      font-size: 0.875rem;
      color: var(--mat-sys-on-surface-variant, #64748b);
      max-width: 420px;
      margin: 0 0 20px 0;
      line-height: 1.5;
    }

    .ui-empty-actions {
      display: flex;
      gap: 12px;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
    }
  `,
})
export class UiEmptyState {
  readonly icon = input<string>('search_off');
  readonly title = input.required<string>();
  readonly description = input<string>('');
  readonly actionLabel = input<string>('');
  readonly actionIcon = input<string>('');

  readonly actionClick = output<void>();
}
