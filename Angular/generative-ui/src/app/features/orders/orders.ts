import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UiPageHeader } from '@shared/ui/components/page-header';
import { UiMetricCard } from '@shared/ui/components/metric-card';
import { UiStatusBadge } from '@shared/ui/components/status-badge';
import { UiSearchInput } from '@shared/ui/components/search-input';
import { UiEmptyState } from '@shared/ui/components/empty-state';
import { UiConfirmService } from '@shared/ui/components/confirm-dialog';
import { UiCopyToClipboardDirective } from '@shared/ui/directives';
import { TrackEventDirective } from '@event-bus/directives';
import { OrderService } from '@core/services/order.service';
import { Order, OrderStatus } from '@core/models/ecommerce.models';
import { CreateOrderDialog } from './create-order-dialog/create-order-dialog';
import { StatusUpdateDialog } from './status-update-dialog/status-update-dialog';

interface StatusFilterTab {
  label: string;
  value: string;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatMenuModule,
    MatTooltipModule,
    MatDividerModule,
    MatProgressBarModule,
    MatDialogModule,
    UiPageHeader,
    UiMetricCard,
    UiStatusBadge,
    UiSearchInput,
    UiEmptyState,
    UiCopyToClipboardDirective,
    TrackEventDirective,
  ],
  templateUrl: './orders.html',
  styleUrl: './orders.scss',
})
export class OrdersComponent implements OnInit {
  private readonly orderService = inject(OrderService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly confirmService = inject(UiConfirmService);

  readonly displayedColumns: string[] = [
    'orderNumber',
    'customer',
    'items',
    'total',
    'status',
    'logistics',
    'actions',
  ];

  readonly filterTabs: StatusFilterTab[] = [
    { label: 'All Orders', value: 'all' },
    { label: 'Processing', value: 'processing' },
    { label: 'Shipped', value: 'shipped' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Pending', value: 'pending' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  readonly searchQuery = signal<string>('');
  readonly selectedStatus = signal<string>('all');

  // Dynamic signals from OrderService
  readonly allOrders = this.orderService.orders;
  readonly isLoading = this.orderService.isLoading;
  readonly error = this.orderService.error;

  readonly filteredOrders = computed(() => {
    const list = this.allOrders();
    const q = this.searchQuery().toLowerCase().trim();
    const status = this.selectedStatus();

    return list.filter((order) => {
      const matchesStatus = status === 'all' || order.status === status;
      const matchesQuery =
        !q ||
        order.orderNumber.toLowerCase().includes(q) ||
        order.customerName.toLowerCase().includes(q) ||
        order.customerEmail.toLowerCase().includes(q) ||
        (order.trackingNumber && order.trackingNumber.toLowerCase().includes(q));

      return matchesStatus && matchesQuery;
    });
  });

  readonly totalOrdersCount = computed(() => this.allOrders().length);
  readonly processingCount = computed(
    () => this.allOrders().filter((o) => o.status === 'processing').length
  );
  readonly shippedCount = computed(
    () => this.allOrders().filter((o) => o.status === 'shipped').length
  );
  readonly deliveredCount = computed(
    () => this.allOrders().filter((o) => o.status === 'delivered').length
  );

  ngOnInit(): void {
    this.orderService.loadOrders();
  }

  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  setStatusFilter(status: string): void {
    this.selectedStatus.set(status);
  }

  clearAllFilters(): void {
    this.searchQuery.set('');
    this.selectedStatus.set('all');
  }

  formatDate(dateVal: string | Date | undefined): string {
    if (!dateVal) return 'N/A';
    return new Date(dateVal).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  getItemsList(order: Order): string {
    if (!order.items || order.items.length === 0) return 'No items';
    return order.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ');
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CreateOrderDialog, {
      width: '640px',
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.orderService.createOrder(result).subscribe();
      }
    });
  }

  openQuickStatusModal(order: Order): void {
    const dialogRef = this.dialog.open(StatusUpdateDialog, {
      width: '420px',
      data: { order },
    });

    dialogRef.afterClosed().subscribe((newStatus: OrderStatus | undefined) => {
      if (newStatus) {
        this.orderService.updateOrder(order.id, { status: newStatus }).subscribe();
      }
    });
  }

  openSupportTicketForOrder(order: Order): void {
    this.router.navigate(['/support'], {
      queryParams: { orderNumber: order.orderNumber, email: order.customerEmail },
    });
  }

  deleteOrder(order: Order): void {
    this.confirmService
      .confirm({
        title: 'Delete Order',
        message: `Are you sure you want to delete order ${order.orderNumber}? This action cannot be undone.`,
        confirmText: 'Delete Order',
        isDestructive: true,
      })
      .subscribe((confirmed) => {
        if (confirmed) {
          this.orderService.deleteOrder(order.id).subscribe();
        }
      });
  }
}
