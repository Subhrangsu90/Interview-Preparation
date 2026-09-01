import { Component, computed, inject, input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UiLoadingService } from '../../services/loading.service';

@Component({
  selector: 'ui-loading-spinner',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  template: `
    @if (shouldShow()) {
      <div
        [class.loading-overlay]="fullscreen()"
        [class.loading-inline]="!fullscreen()"
        role="status"
        aria-live="polite"
        [attr.aria-label]="message()"
      >
        <div class="spinner-card">
          <mat-spinner [diameter]="diameter()" [strokeWidth]="strokeWidth()"></mat-spinner>
          @if (message()) {
            <span class="loading-text">{{ message() }}</span>
          }
        </div>
      </div>
    }
  `,
  styles: `
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(15, 23, 42, 0.4);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      pointer-events: auto;
      transition: opacity 0.2s ease;
    }

    .loading-inline {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 32px 16px;
      width: 100%;
    }

    .spinner-card {
      background: var(--mat-sys-surface-container-high, #ffffff);
      padding: 24px 32px;
      border-radius: 16px;
      box-shadow:
        0 10px 25px -5px rgba(0, 0, 0, 0.2),
        0 8px 10px -6px rgba(0, 0, 0, 0.15);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
      border: 1px solid var(--mat-sys-outline-variant, #e2e8f0);
      transition: background-color 0.2s ease, border-color 0.2s ease;
    }

    .loading-text {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--mat-sys-on-surface, #334155);
      letter-spacing: 0.01em;
    }

    :host-context(.dark-theme) {
      .loading-overlay {
        background: rgba(0, 0, 0, 0.65);
        backdrop-filter: blur(6px);
      }

      .spinner-card {
        background: var(--mat-sys-surface-container-high, #1e293b);
        border: 1px solid var(--mat-sys-outline-variant, rgba(255, 255, 255, 0.12));
        box-shadow:
          0 20px 35px -5px rgba(0, 0, 0, 0.7),
          0 10px 15px -6px rgba(0, 0, 0, 0.5);
      }

      .loading-text {
        color: var(--mat-sys-on-surface, #f1f5f9);
      }
    }
  `,
})
export class UiLoadingSpinner {
  private readonly loadingService = inject(UiLoadingService);

  readonly loading = input<boolean | null>(null);
  readonly message = input<string>('Loading...');
  readonly diameter = input<number>(48);
  readonly strokeWidth = input<number>(4);
  readonly fullscreen = input<boolean>(true);

  readonly shouldShow = computed(() => {
    const explicit = this.loading();
    return explicit !== null ? explicit : this.loadingService.isLoading();
  });
}
