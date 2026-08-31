import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

@Component({
  selector: 'ui-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title class="ui-confirm-title">
      @if (data.isDestructive) {
        <mat-icon class="destructive-icon">warning</mat-icon>
      }
      <span>{{ data.title }}</span>
    </h2>

    <mat-dialog-content class="ui-confirm-content">
      <p>{{ data.message }}</p>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="ui-confirm-actions">
      <button mat-button type="button" (click)="dialogRef.close(false)">
        {{ data.cancelText || 'Cancel' }}
      </button>
      <button
        mat-flat-button
        [color]="data.isDestructive ? 'warn' : 'primary'"
        type="button"
        (click)="dialogRef.close(true)"
      >
        {{ data.confirmText || 'Confirm' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    .ui-confirm-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 1.25rem;
      font-weight: 600;

      .destructive-icon {
        color: #ef4444;
      }
    }

    .ui-confirm-content {
      font-size: 0.95rem;
      color: var(--mat-sys-on-surface-variant, #475569);
      line-height: 1.5;
    }

    .ui-confirm-actions {
      padding: 16px 24px;
      gap: 8px;
    }
  `,
})
export class UiConfirmDialog {
  readonly dialogRef = inject(MatDialogRef<UiConfirmDialog>);
  readonly data: ConfirmDialogData = inject(MAT_DIALOG_DATA);
}
