import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CreateTicketDto, TicketType } from '../../../core/models/ecommerce.models';

@Component({
  selector: 'app-create-ticket-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title class="dialog-title">
      <mat-icon class="dialog-icon">support_agent</mat-icon>
      Create Support Ticket / Return Request
    </h2>

    <mat-dialog-content class="dialog-content">
      <form [formGroup]="form" class="ticket-form">
        <div class="form-row">
          <mat-form-field appearance="outline" class="flex-1">
            <mat-label>Related Order #</mat-label>
            <input matInput formControlName="orderNumber" placeholder="e.g. ORD-7821" />
            @if (form.get('orderNumber')?.invalid && form.get('orderNumber')?.touched) {
              <mat-error>Order number is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="flex-1">
            <mat-label>Customer Email</mat-label>
            <input matInput formControlName="customerEmail" type="email" placeholder="customer@example.com" />
            @if (form.get('customerEmail')?.invalid && form.get('customerEmail')?.touched) {
              <mat-error>Valid email is required</mat-error>
            }
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="flex-1">
            <mat-label>Request Type</mat-label>
            <mat-select formControlName="type">
              <mat-option value="return">Product Return</mat-option>
              <mat-option value="refund">Refund Request</mat-option>
              <mat-option value="cancellation">Order Cancellation</mat-option>
              <mat-option value="shipping_delay">Shipping Delay Inquiry</mat-option>
              <mat-option value="inquiry">General Inquiry</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="flex-1">
            <mat-label>Priority</mat-label>
            <mat-select formControlName="priority">
              <mat-option value="low">Low</mat-option>
              <mat-option value="medium">Medium</mat-option>
              <mat-option value="high">High</mat-option>
              <mat-option value="urgent">Urgent</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Subject / Reason</mat-label>
          <input matInput formControlName="subject" placeholder="e.g. Damaged item during transit" />
          @if (form.get('subject')?.invalid && form.get('subject')?.touched) {
            <mat-error>Subject must be at least 3 characters</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Detailed Description</mat-label>
          <textarea
            matInput
            rows="3"
            formControlName="description"
            placeholder="Please detail the reason for return, replacement, or issue..."
          ></textarea>
          @if (form.get('description')?.invalid && form.get('description')?.touched) {
            <mat-error>Description must be at least 5 characters</mat-error>
          }
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button
        mat-flat-button
        color="primary"
        [disabled]="form.invalid"
        (click)="submit()"
      >
        Submit Request
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    .dialog-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1.3rem;
      font-weight: 700;
      color: #0f172a;
      .dialog-icon { color: #2563eb; }
    }
    .dialog-content {
      padding-top: 10px;
    }
    .ticket-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .form-row {
      display: flex;
      gap: 16px;
      @media (max-width: 600px) {
        flex-direction: column;
        gap: 0;
      }
    }
    .flex-1 { flex: 1; }
    .full-width { width: 100%; }
  `,
})
export class CreateTicketDialog implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<CreateTicketDialog>);
  readonly data = inject<{ orderNumber?: string; customerEmail?: string; type?: TicketType } | null>(
    MAT_DIALOG_DATA
  );

  readonly form: FormGroup = this.fb.group({
    orderNumber: ['', [Validators.required]],
    customerEmail: ['', [Validators.required, Validators.email]],
    type: ['return', [Validators.required]],
    priority: ['medium', [Validators.required]],
    subject: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(5)]],
  });

  ngOnInit(): void {
    if (this.data) {
      if (this.data.orderNumber) {
        this.form.patchValue({ orderNumber: this.data.orderNumber });
      }
      if (this.data.customerEmail) {
        this.form.patchValue({ customerEmail: this.data.customerEmail });
      }
      if (this.data.type) {
        this.form.patchValue({ type: this.data.type });
      }
    }
  }

  submit(): void {
    if (this.form.valid) {
      const formVal = this.form.value;
      const dto: CreateTicketDto = {
        orderNumber: formVal.orderNumber.toUpperCase(),
        customerEmail: formVal.customerEmail,
        type: formVal.type,
        priority: formVal.priority,
        subject: formVal.subject,
        description: formVal.description,
      };
      this.dialogRef.close(dto);
    }
  }
}
