import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, tap } from 'rxjs';
import {
  Order,
  CreateOrderDto,
  UpdateOrderDto,
  TrackingInfo,
  ApiResponse,
} from '../models/ecommerce.models';

const INITIAL_MOCK_ORDERS: Order[] = [
  {
    id: 1,
    orderNumber: 'ORD-7821',
    customerName: 'Sarah Jenkins',
    customerEmail: 'sarah.j@example.com',
    status: 'shipped',
    totalAmount: '249.98',
    currency: 'USD',
    shippingAddress: '742 Evergreen Terrace, Springfield, OR 97477',
    carrier: 'FedEx Express',
    trackingNumber: 'FDX-982341829',
    estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    items: [
      {
        id: 101,
        productName: 'Ergonomic Wireless Mechanical Keyboard',
        sku: 'KB-WL-RGB',
        quantity: 1,
        unitPrice: '149.99',
        imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300',
      },
      {
        id: 102,
        productName: 'Precision Gaming Mouse with Qi Charging',
        sku: 'MS-PRO-QI',
        quantity: 1,
        unitPrice: '99.99',
        imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=300',
      },
    ],
  },
  {
    id: 2,
    orderNumber: 'ORD-9104',
    customerName: 'Marcus Vance',
    customerEmail: 'marcus.v@example.com',
    status: 'delivered',
    totalAmount: '129.50',
    currency: 'USD',
    shippingAddress: '1204 Pine Street, Seattle, WA 98101',
    carrier: 'UPS Ground',
    trackingNumber: '1Z9999999999999999',
    estimatedDelivery: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    items: [
      {
        id: 103,
        productName: 'Active Noise-Cancelling Bluetooth Headphones',
        sku: 'HP-ANC-BLK',
        quantity: 1,
        unitPrice: '129.50',
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
      },
    ],
  },
  {
    id: 3,
    orderNumber: 'ORD-3312',
    customerName: 'Elena Rostova',
    customerEmail: 'elena.r@example.com',
    status: 'processing',
    totalAmount: '599.00',
    currency: 'USD',
    shippingAddress: '450 Bayview Ave, San Francisco, CA 94107',
    carrier: 'DHL Express',
    trackingNumber: 'DHL-554190823',
    estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    items: [
      {
        id: 104,
        productName: 'Ultra-Wide 34" Curved Productivity Monitor',
        sku: 'MON-34-UW',
        quantity: 1,
        unitPrice: '599.00',
        imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300',
      },
    ],
  },
  {
    id: 4,
    orderNumber: 'ORD-5520',
    customerName: 'David Chen',
    customerEmail: 'david.c@example.com',
    status: 'pending',
    totalAmount: '89.90',
    currency: 'USD',
    shippingAddress: '88 Tech Blvd, Austin, TX 78701',
    carrier: 'USPS Priority',
    trackingNumber: 'USPS-940011189',
    estimatedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    items: [
      {
        id: 105,
        productName: 'USB-C 10-in-1 Aluminum Docking Station',
        sku: 'HUB-USBC-10',
        quantity: 1,
        unitPrice: '89.90',
        imageUrl: 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=300',
      },
    ],
  },
];

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/orders';

  // Signals
  readonly orders = signal<Order[]>(INITIAL_MOCK_ORDERS);
  readonly selectedOrder = signal<Order | null>(null);
  readonly trackingInfo = signal<TrackingInfo | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  loadOrders(filters?: { status?: string; search?: string }): void {
    this.isLoading.set(true);
    const params: Record<string, string> = {};
    if (filters?.status && filters.status !== 'all') params['status'] = filters.status;
    if (filters?.search) params['search'] = filters.search;

    this.http
      .get<ApiResponse<Order[]>>(this.baseUrl, { params })
      .pipe(
        map((res) => res.data ?? []),
        catchError(() => {
          // Fallback to local filtering
          let local = [...this.orders()];
          if (filters?.status && filters.status !== 'all') {
            local = local.filter((o) => o.status === filters.status);
          }
          if (filters?.search) {
            const q = filters.search.toLowerCase();
            local = local.filter(
              (o) =>
                o.orderNumber.toLowerCase().includes(q) ||
                o.customerName.toLowerCase().includes(q) ||
                o.customerEmail.toLowerCase().includes(q)
            );
          }
          return of(local);
        })
      )
      .subscribe({
        next: (data) => {
          this.orders.set(data);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set(err?.message || 'Failed to load orders');
          this.isLoading.set(false);
        },
      });
  }

  getOrderById(id: number): Observable<Order | null> {
    this.isLoading.set(true);
    return this.http.get<ApiResponse<Order>>(`${this.baseUrl}/${id}`).pipe(
      map((res) => res.data ?? null),
      catchError(() => {
        const found = this.orders().find((o) => o.id === id) ?? null;
        return of(found);
      }),
      tap((order) => {
        this.selectedOrder.set(order);
        this.isLoading.set(false);
      })
    );
  }

  getOrderByNumber(orderNumber: string): Observable<Order | null> {
    const num = orderNumber.trim().toUpperCase();
    this.isLoading.set(true);
    return this.http.get<ApiResponse<Order>>(`${this.baseUrl}/number/${num}`).pipe(
      map((res) => res.data ?? null),
      catchError(() => {
        const found = this.orders().find((o) => o.orderNumber.toUpperCase() === num) ?? null;
        return of(found);
      }),
      tap((order) => {
        this.selectedOrder.set(order);
        this.isLoading.set(false);
      })
    );
  }

  getTracking(orderNumber: string): Observable<TrackingInfo | null> {
    const num = orderNumber.trim().toUpperCase();
    return this.http.get<ApiResponse<TrackingInfo>>(`${this.baseUrl}/tracking/${num}`).pipe(
      map((res) => res.data ?? null),
      catchError(() => {
        const order = this.orders().find((o) => o.orderNumber.toUpperCase() === num);
        if (!order) return of(null);
        const fallbackTracking: TrackingInfo = {
          orderNumber: order.orderNumber,
          carrier: order.carrier || 'FedEx',
          trackingNumber: order.trackingNumber || 'FDX-LOCAL',
          status: order.status,
          estimatedDelivery: 'In 2-3 business days',
          checkpoints: [
            {
              status: 'Order Placed',
              location: 'Merchant Fulfillment Hub',
              timestamp: new Date(order.createdAt).toLocaleString(),
              description: 'Order processed and queued for shipping.',
            },
            {
              status: 'In Transit',
              location: 'Regional Sorting Facility',
              timestamp: new Date().toLocaleString(),
              description: `En route via ${order.carrier}.`,
            },
          ],
        };
        return of(fallbackTracking);
      }),
      tap((info) => this.trackingInfo.set(info))
    );
  }

  createOrder(dto: CreateOrderDto): Observable<Order> {
    return this.http.post<ApiResponse<Order>>(this.baseUrl, dto).pipe(
      map((res) => res.data!),
      catchError(() => {
        const newOrder: Order = {
          id: Date.now(),
          orderNumber: dto.orderNumber?.toUpperCase() || `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
          customerName: dto.customerName,
          customerEmail: dto.customerEmail,
          status: dto.status || 'processing',
          totalAmount: dto.items
            .reduce((acc, itm) => acc + Number(itm.unitPrice) * itm.quantity, 0)
            .toFixed(2),
          currency: 'USD',
          shippingAddress: dto.shippingAddress,
          carrier: dto.carrier || 'FedEx',
          trackingNumber: dto.trackingNumber || `TRK-${Math.floor(100000000 + Math.random() * 900000000)}`,
          estimatedDelivery: dto.estimatedDelivery || new Date(Date.now() + 3 * 86400000).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          items: dto.items.map((i, idx) => ({
            id: idx + 1,
            productName: i.productName,
            sku: i.sku,
            quantity: i.quantity,
            unitPrice: String(i.unitPrice),
            imageUrl: i.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300',
          })),
        };
        return of(newOrder);
      }),
      tap((created) => {
        this.orders.update((list) => [created, ...list]);
      })
    );
  }

  updateOrder(id: number, dto: UpdateOrderDto): Observable<Order | null> {
    return this.http.patch<ApiResponse<Order>>(`${this.baseUrl}/${id}`, dto).pipe(
      map((res) => res.data ?? null),
      catchError(() => {
        const current = this.orders().find((o) => o.id === id);
        if (!current) return of(null);
        const updated: Order = { ...current, ...dto, updatedAt: new Date().toISOString() };
        return of(updated);
      }),
      tap((updated) => {
        if (updated) {
          this.orders.update((list) => list.map((o) => (o.id === id ? updated : o)));
          if (this.selectedOrder()?.id === id) {
            this.selectedOrder.set(updated);
          }
        }
      })
    );
  }

  deleteOrder(id: number): Observable<boolean> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`).pipe(
      map(() => true),
      catchError(() => of(true)),
      tap(() => {
        this.orders.update((list) => list.filter((o) => o.id !== id));
        if (this.selectedOrder()?.id === id) {
          this.selectedOrder.set(null);
        }
      })
    );
  }
}
