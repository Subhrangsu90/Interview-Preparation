import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Order, OrderStatus } from '@core/models/ecommerce.models';

@Component({
  selector: 'app-status-update-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title class="dialog-title">
      <mat-icon class="dialog-icon">sync_alt</mat-icon>
      Update Order Status
    </h2>

    <mat-dialog-content class="dialog-content">
      <p class="order-info">
        Changing status for order <strong>{{ data.order.orderNumber }}</strong>
      </p>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Order Status</mat-label>
        <mat-select [(value)]="selectedStatus">
          <mat-option value="pending">Pending</mat-option>
          <mat-option value="processing">Processing</mat-option>
          <mat-option value="shipped">Shipped (In Transit)</mat-option>
          <mat-option value="delivered">Delivered</mat-option>
          <mat-option value="cancelled">Cancelled</mat-option>
        </mat-select>
      </mat-form-field>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="primary" (click)="save()">Save Status</button>
    </mat-dialog-actions>
  `,
  styles: `
    .dialog-title {
      display: flex;
      align-items: center;
      gap: 8px;
      .dialog-icon {
        color: var(--mat-sys-primary);
      }
    }
    .dialog-content {
      padding-top: 8px;
      .order-info {
        color: #475569;
        margin-bottom: 16px;
        font-size: 0.95rem;
      }
    }
    .full-width {
      width: 100%;
    }
  `,
})
export class StatusUpdateDialog {
  readonly data = inject<{ order: Order }>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<StatusUpdateDialog>);

  selectedStatus: OrderStatus = this.data.order.status;

  save(): void {
    this.dialogRef.close(this.selectedStatus);
  }
}
