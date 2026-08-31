import { Component, inject, signal } from '@angular/core';
import { form, FormField, submit, required, email, min, applyEach } from '@angular/forms/signals';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { CreateOrderDto, OrderStatus } from '../../../core/models/ecommerce.models';

@Component({
  selector: 'app-create-order-dialog',
  standalone: true,
  imports: [
    FormField,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>add_shopping_cart</mat-icon>
      Create New Order
    </h2>

    <mat-dialog-content>
      <form id="createOrderForm" (submit)="onSubmit(); $event.preventDefault()" class="order-form">
        <div class="form-row">
          <mat-form-field appearance="outline" class="flex-1">
            <mat-label>Customer Full Name</mat-label>
            <input matInput [formField]="orderForm.customerName" placeholder="e.g. Jane Doe" />
            @if (orderForm.customerName().touched() && orderForm.customerName().errors().length) {
              <mat-error>{{ orderForm.customerName().errors()[0].message }}</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="flex-1">
            <mat-label>Customer Email</mat-label>
            <input
              matInput
              [formField]="orderForm.customerEmail"
              type="email"
              placeholder="jane@example.com"
            />
            @if (orderForm.customerEmail().touched() && orderForm.customerEmail().errors().length) {
              <mat-error>{{ orderForm.customerEmail().errors()[0].message }}</mat-error>
            }
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="flex-1">
            <mat-label>Status</mat-label>
            <mat-select [formField]="orderForm.status">
              <mat-option value="processing">Processing</mat-option>
              <mat-option value="pending">Pending</mat-option>
              <mat-option value="shipped">Shipped</mat-option>
              <mat-option value="delivered">Delivered</mat-option>
            </mat-select>
            @if (orderForm.status().touched() && orderForm.status().errors().length) {
              <mat-error>{{ orderForm.status().errors()[0].message }}</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="flex-1">
            <mat-label>Shipping Carrier</mat-label>
            <mat-select [formField]="orderForm.carrier">
              <mat-option value="FedEx Express">FedEx Express</mat-option>
              <mat-option value="UPS Ground">UPS Ground</mat-option>
              <mat-option value="DHL Express">DHL Express</mat-option>
              <mat-option value="USPS Priority">USPS Priority</mat-option>
            </mat-select>
            @if (orderForm.carrier().touched() && orderForm.carrier().errors().length) {
              <mat-error>{{ orderForm.carrier().errors()[0].message }}</mat-error>
            }
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Delivery Shipping Address</mat-label>
          <textarea
            matInput
            rows="2"
            [formField]="orderForm.shippingAddress"
            placeholder="Street address, City, State, ZIP"
          ></textarea>
          @if (
            orderForm.shippingAddress().touched() && orderForm.shippingAddress().errors().length
          ) {
            <mat-error>{{ orderForm.shippingAddress().errors()[0].message }}</mat-error>
          }
        </mat-form-field>

        <mat-divider />

        <div class="items-header">
          <h3>Order Items</h3>
          <button type="button" mat-stroked-button (click)="addItem()">
            <mat-icon>add</mat-icon> Add Item
          </button>
        </div>

        <div class="items-list">
          @for (item of orderForm.items; track $index; let i = $index) {
            <div class="item-row">
              <mat-form-field appearance="outline">
                <mat-label>Product Name</mat-label>
                <input matInput [formField]="item.productName" placeholder="e.g. Wireless Mouse" />
                @if (item.productName().touched() && item.productName().errors().length) {
                  <mat-error>{{ item.productName().errors()[0].message }}</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>SKU</mat-label>
                <input matInput [formField]="item.sku" placeholder="SKU-101" />
                @if (item.sku().touched() && item.sku().errors().length) {
                  <mat-error>{{ item.sku().errors()[0].message }}</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Qty</mat-label>
                <input matInput type="number" [formField]="item.quantity" />
                @if (item.quantity().touched() && item.quantity().errors().length) {
                  <mat-error>{{ item.quantity().errors()[0].message }}</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Price ($)</mat-label>
                <input matInput type="number" step="0.01" [formField]="item.unitPrice" />
                @if (item.unitPrice().touched() && item.unitPrice().errors().length) {
                  <mat-error>{{ item.unitPrice().errors()[0].message }}</mat-error>
                }
              </mat-form-field>

              @if (orderForm.items.length > 1) {
                <button
                  type="button"
                  mat-icon-button
                  (click)="removeItem(i)"
                  aria-label="Remove item"
                >
                  <mat-icon>delete_outline</mat-icon>
                </button>
              }
            </div>
          }
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close type="button">Cancel</button>
      <button
        mat-flat-button
        color="primary"
        type="submit"
        form="createOrderForm"
        [disabled]="orderForm().invalid()"
      >
        Create Order
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    h2[mat-dialog-title] {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .order-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding-top: 8px;
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

    .items-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h3 {
        margin: 0;
      }
    }

    .items-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .item-row {
      display: grid;
      grid-template-columns: 2.5fr 1.5fr 1fr 1.2fr auto;
      gap: 12px;
      align-items: start;

      @media (max-width: 600px) {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class CreateOrderDialog {
  private readonly dialogRef = inject(MatDialogRef<CreateOrderDialog>);

  protected readonly orderModel = signal({
    customerName: '',
    customerEmail: '',
    status: 'processing' as OrderStatus,
    carrier: 'FedEx Express',
    shippingAddress: '',
    items: [
      {
        productName: '',
        sku: `SKU-${Math.floor(100 + Math.random() * 900)}`,
        quantity: 1,
        unitPrice: 49.99,
      },
    ],
  });

  protected readonly orderForm = form(this.orderModel, (s) => {
    required(s.customerName, { message: 'Name is required' });
    required(s.customerEmail, { message: 'Email is required' });
    email(s.customerEmail, { message: 'Valid email is required' });
    required(s.status, { message: 'Status is required' });
    required(s.carrier, { message: 'Carrier is required' });
    required(s.shippingAddress, { message: 'Shipping address is required' });

    applyEach(s.items, (item) => {
      required(item.productName, { message: 'Product name is required' });
      required(item.sku, { message: 'SKU is required' });
      min(item.quantity, 1, { message: 'Quantity must be at least 1' });
      min(item.unitPrice, 0, { message: 'Price cannot be negative' });
    });
  });

  addItem(): void {
    this.orderModel.update((m) => ({
      ...m,
      items: [
        ...m.items,
        {
          productName: '',
          sku: `SKU-${Math.floor(100 + Math.random() * 900)}`,
          quantity: 1,
          unitPrice: 49.99,
        },
      ],
    }));
  }

  removeItem(index: number): void {
    if (this.orderModel().items.length > 1) {
      this.orderModel.update((m) => ({
        ...m,
        items: m.items.filter((_, i) => i !== index),
      }));
    }
  }

  onSubmit(): void {
    submit(this.orderForm, async () => {
      const formVal = this.orderModel();
      const dto: CreateOrderDto = {
        customerName: formVal.customerName,
        customerEmail: formVal.customerEmail,
        status: formVal.status,
        carrier: formVal.carrier,
        shippingAddress: formVal.shippingAddress,
        items: formVal.items.map((item) => ({
          productName: item.productName,
          sku: item.sku,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
        })),
      };
      this.dialogRef.close(dto);
    });
  }
}
