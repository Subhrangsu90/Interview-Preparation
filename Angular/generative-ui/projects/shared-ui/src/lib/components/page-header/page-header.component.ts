import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'ui-page-header',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="ui-page-header">
      <div class="ui-header-titles">
        <h1 class="ui-page-title">
          @if (icon()) {
            <mat-icon class="ui-title-icon">{{ icon() }}</mat-icon>
          }
          <span>{{ title() }}</span>
        </h1>
        @if (subtitle()) {
          <p class="ui-page-subtitle">{{ subtitle() }}</p>
        }
        <ng-content select="[meta]" />
      </div>
      <div class="ui-header-actions">
        <ng-content select="[actions]" />
        <ng-content />
      </div>
    </div>
  `,
  styles: `
    .ui-page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 8px;
    }

    .ui-header-titles {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .ui-page-title {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0;
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--mat-sys-on-surface, #0f172a);
      line-height: 1.25;
    }

    .ui-title-icon {
      color: var(--mat-sys-primary, #0284c7);
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
    }

    .ui-page-subtitle {
      margin: 0;
      color: var(--mat-sys-on-surface-variant, #64748b);
      font-size: 0.95rem;
      font-weight: 400;
    }

    .ui-header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
  `,
})
export class UiPageHeader {
  readonly title = input.required<string>();
  readonly subtitle = input<string>('');
  readonly icon = input<string>('');
}
