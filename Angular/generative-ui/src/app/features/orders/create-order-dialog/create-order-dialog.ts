import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { CreateOrderDto } from '../../../core/models/ecommerce.models';

@Component({
  selector: 'app-create-order-dialog',
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
    MatDividerModule,
  ],
  template: `
    <h2 mat-dialog-title class="dialog-title">
      <mat-icon class="dialog-icon">add_shopping_cart</mat-icon>
      Create New Order
    </h2>

    <mat-dialog-content class="dialog-content">
      <form [formGroup]="form" class="order-form">
        <div class="form-row">
          <mat-form-field appearance="outline" class="flex-1">
            <mat-label>Customer Full Name</mat-label>
            <input matInput formControlName="customerName" placeholder="e.g. Jane Doe" />
            @if (form.get('customerName')?.invalid && form.get('customerName')?.touched) {
              <mat-error>Name is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="flex-1">
            <mat-label>Customer Email</mat-label>
            <input matInput formControlName="customerEmail" type="email" placeholder="jane@example.com" />
            @if (form.get('customerEmail')?.invalid && form.get('customerEmail')?.touched) {
              <mat-error>Valid email is required</mat-error>
            }
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="flex-1">
            <mat-label>Status</mat-label>
            <mat-select formControlName="status">
              <mat-option value="processing">Processing</mat-option>
              <mat-option value="pending">Pending</mat-option>
              <mat-option value="shipped">Shipped</mat-option>
              <mat-option value="delivered">Delivered</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="flex-1">
            <mat-label>Shipping Carrier</mat-label>
            <mat-select formControlName="carrier">
              <mat-option value="FedEx Express">FedEx Express</mat-option>
              <mat-option value="UPS Ground">UPS Ground</mat-option>
              <mat-option value="DHL Express">DHL Express</mat-option>
              <mat-option value="USPS Priority">USPS Priority</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Delivery Shipping Address</mat-label>
          <textarea
            matInput
            rows="2"
            formControlName="shippingAddress"
            placeholder="Street address, City, State, ZIP"
          ></textarea>
          @if (form.get('shippingAddress')?.invalid && form.get('shippingAddress')?.touched) {
            <mat-error>Shipping address is required</mat-error>
          }
        </mat-form-field>

        <mat-divider class="section-divider" />

        <div class="items-header">
          <h3 class="section-heading">Order Items</h3>
          <button type="button" mat-stroked-button (click)="addItem()">
            <mat-icon>add</mat-icon> Add Item
          </button>
        </div>

        <div formArrayName="items" class="items-list">
          @for (item of itemsArray.controls; track $index; let i = $index) {
            <div [formGroupName]="i" class="item-row">
              <mat-form-field appearance="outline" class="item-name-field">
                <mat-label>Product Name</mat-label>
                <input matInput formControlName="productName" placeholder="e.g. Wireless Mouse" />
              </mat-form-field>

              <mat-form-field appearance="outline" class="item-sku-field">
                <mat-label>SKU</mat-label>
                <input matInput formControlName="sku" placeholder="SKU-101" />
              </mat-form-field>

              <mat-form-field appearance="outline" class="item-qty-field">
                <mat-label>Qty</mat-label>
                <input matInput type="number" min="1" formControlName="quantity" />
              </mat-form-field>

              <mat-form-field appearance="outline" class="item-price-field">
                <mat-label>Price ($)</mat-label>
                <input matInput type="number" step="0.01" min="0" formControlName="unitPrice" />
              </mat-form-field>

              @if (itemsArray.length > 1) {
                <button
                  type="button"
                  mat-icon-button
                  color="warn"
                  class="remove-item-btn"
                  (click)="removeItem(i)"
                >
                  <mat-icon>delete_outline</mat-icon>
                </button>
              }
            </div>
          }
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="dialog-actions">
      <button mat-button mat-dialog-close>Cancel</button>
      <button
        mat-flat-button
        color="primary"
        [disabled]="form.invalid"
        (click)="submit()"
      >
        Create Order
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    .dialog-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1.35rem;
      font-weight: 700;
      color: #0f172a;
      .dialog-icon {
        color: #2563eb;
      }
    }
    .dialog-content {
      padding-top: 12px;
      max-height: 75vh;
    }
    .order-form {
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
    .flex-1 {
      flex: 1;
    }
    .full-width {
      width: 100%;
    }
    .section-divider {
      margin: 12px 0;
    }
    .items-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      .section-heading {
        margin: 0;
        font-size: 1.05rem;
        font-weight: 600;
        color: #1e293b;
      }
    }
    .items-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .item-row {
      display: flex;
      gap: 10px;
      align-items: center;
      background: #f8fafc;
      padding: 10px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      .item-name-field { flex: 3; }
      .item-sku-field { flex: 2; }
      .item-qty-field { flex: 1; }
      .item-price-field { flex: 1.5; }
      .remove-item-btn { margin-bottom: 18px; }
      @media (max-width: 600px) {
        flex-wrap: wrap;
        .item-name-field, .item-sku-field, .item-qty-field, .item-price-field {
          flex: 100%;
        }
      }
    }
    .dialog-actions {
      padding: 16px 24px;
    }
  `,
})
export class CreateOrderDialog {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<CreateOrderDialog>);

  readonly form: FormGroup = this.fb.group({
    customerName: ['', [Validators.required]],
    customerEmail: ['', [Validators.required, Validators.email]],
    status: ['processing', [Validators.required]],
    carrier: ['FedEx Express', [Validators.required]],
    shippingAddress: ['', [Validators.required]],
    items: this.fb.array([this.createItemFormGroup()]),
  });

  get itemsArray(): FormArray {
    return this.form.get('items') as FormArray;
  }

  createItemFormGroup(): FormGroup {
    return this.fb.group({
      productName: ['', [Validators.required]],
      sku: [`SKU-${Math.floor(100 + Math.random() * 900)}`, [Validators.required]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [49.99, [Validators.required, Validators.min(0)]],
    });
  }

  addItem(): void {
    this.itemsArray.push(this.createItemFormGroup());
  }

  removeItem(index: number): void {
    if (this.itemsArray.length > 1) {
      this.itemsArray.removeAt(index);
    }
  }

  submit(): void {
    if (this.form.valid) {
      const formVal = this.form.value;
      const dto: CreateOrderDto = {
        customerName: formVal.customerName,
        customerEmail: formVal.customerEmail,
        status: formVal.status,
        carrier: formVal.carrier,
        shippingAddress: formVal.shippingAddress,
        items: formVal.items,
      };
      this.dialogRef.close(dto);
    }
  }
}
