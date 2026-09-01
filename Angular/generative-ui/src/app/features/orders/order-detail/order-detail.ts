import {
  Component,
  inject,
  signal,
  computed,
  input,
  effect,
  DestroyRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UiStatusBadge } from '@shared/ui/components/status-badge';
import { UiCopyToClipboardDirective } from '@shared/ui/directives';
import { UiPagination } from '@shared/ui/components/pagination';
import { UiEmptyState } from '@shared/ui/components/empty-state';
import { OrderService } from '@core/services/order.service';
import { Order, OrderItem, OrderStatus } from '@core/models/ecommerce.models';
import { StatusUpdateDialog } from '../status-update-dialog/status-update-dialog';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
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
    UiPagination,
    UiEmptyState,
  ],
  templateUrl: './order-detail.html',
  styleUrl: './order-detail.scss',
})
export class OrderDetailComponent {
  private readonly router = inject(Router);
  protected readonly orderService = inject(OrderService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  // Route parameter bound automatically via withComponentInputBinding()
  readonly orderNumber = input.required<string>();

  readonly order = signal<Order | null>(null);
  readonly pageSize = signal<number>(5);
  readonly pageIndex = signal<number>(0);

  readonly pagedItems = computed(() => {
    const items = this.order()?.items || [];
    const size = this.pageSize();
    const maxIndex = Math.max(0, Math.ceil(items.length / size) - 1);
    const index = Math.min(this.pageIndex(), maxIndex);
    const start = index * size;
    return items.slice(start, start + size);
  });

  constructor() {
    effect(() => {
      const param = this.orderNumber();
      if (param) {
        this.loadOrder(param);
      }
    });
  }

  private loadOrder(orderParam: string): void {
    if (!isNaN(Number(orderParam))) {
      this.orderService
        .getOrderById(Number(orderParam))
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((res) => {
          if (res) this.order.set(res);
        });
    } else {
      this.orderService
        .getOrderByNumber(orderParam)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((res) => {
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

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((newStatus: OrderStatus | undefined) => {
        if (newStatus) {
          this.orderService
            .updateOrder(order.id, { status: newStatus })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((updated) => {
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

  goBack(): void {
    this.router.navigate(['/orders']);
  }
}
