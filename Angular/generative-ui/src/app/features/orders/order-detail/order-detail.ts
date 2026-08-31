import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UiStatusBadge, UiCopyToClipboardDirective } from '@shared/ui';
import { OrderService } from '../../../core/services/order.service';
import { Order, OrderItem, OrderStatus } from '../../../core/models/ecommerce.models';
import { StatusUpdateDialog } from '../status-update-dialog/status-update-dialog';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatDialogModule,
    UiStatusBadge,
    UiCopyToClipboardDirective,
  ],
  templateUrl: './order-detail.html',
  styleUrl: './order-detail.scss',
})
export class OrderDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly orderService = inject(OrderService);
  private readonly dialog = inject(MatDialog);

  readonly order = signal<Order | null>(null);

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const orderParam = params.get('orderNumber');
      if (orderParam) {
        this.loadOrder(orderParam);
      }
    });
  }

  private loadOrder(orderParam: string): void {
    if (!isNaN(Number(orderParam))) {
      this.orderService.getOrderById(Number(orderParam)).subscribe((res) => {
        if (res) this.order.set(res);
      });
    } else {
      this.orderService.getOrderByNumber(orderParam).subscribe((res) => {
        if (res) this.order.set(res);
      });
    }
  }

  formatDate(dateVal: string | Date | undefined): string {
    if (!dateVal) return 'N/A';
    return new Date(dateVal).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  formatEstDelivery(dateVal: string | Date | undefined): string {
    if (!dateVal) return 'In 2-3 business days';
    return new Date(dateVal).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }

  getItemTotal(item: OrderItem): string {
    const total = Number(item.unitPrice) * item.quantity;
    return total.toFixed(2);
  }

  isStepCompleted(step: string, currentStatus: OrderStatus): boolean {
    const sequence: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered'];
    const currentIdx = sequence.indexOf(currentStatus);

    switch (step) {
      case 'placed':
        return currentIdx >= 0;
      case 'processing':
        return currentIdx >= 1;
      case 'shipped':
        return currentIdx >= 2;
      case 'delivered':
        return currentIdx >= 3;
      default:
        return false;
    }
  }

  openStatusDialog(order: Order): void {
    const dialogRef = this.dialog.open(StatusUpdateDialog, {
      width: '420px',
      data: { order },
    });

    dialogRef.afterClosed().subscribe((newStatus: OrderStatus | undefined) => {
      if (newStatus) {
        this.orderService.updateOrder(order.id, { status: newStatus }).subscribe((updated) => {
          if (updated) this.order.set(updated);
        });
      }
    });
  }

  requestReturn(order: Order): void {
    this.router.navigate(['/support'], {
      queryParams: {
        orderNumber: order.orderNumber,
        email: order.customerEmail,
        type: 'return',
      },
    });
  }
}
