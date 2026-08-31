import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    @if (loadingService.isLoading()) {
      <div class="loading-overlay" aria-live="polite" aria-label="Loading data">
        <div class="spinner-card">
          <mat-spinner diameter="48" strokeWidth="4"></mat-spinner>
          <span class="loading-text">Loading...</span>
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
      background: rgba(15, 23, 42, 0.35);
      backdrop-filter: blur(2px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      pointer-events: auto;
    }
    .spinner-card {
      background: #ffffff;
      padding: 24px 32px;
      border-radius: 16px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      border: 1px solid #e2e8f0;
    }
    .loading-text {
      font-size: 0.9rem;
      font-weight: 600;
      color: #334155;
    }
  `,
})
export class LoadingSpinner {
  protected readonly loadingService = inject(LoadingService);
}
