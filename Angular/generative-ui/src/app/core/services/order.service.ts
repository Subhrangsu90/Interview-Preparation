import { Injectable, inject, signal } from '@angular/core';
import { catchError, map, Observable, throwError, tap } from 'rxjs';
import { ApiService, ApiError } from '@core/api';
import {
  Order,
  CreateOrderDto,
  UpdateOrderDto,
  TrackingInfo,
  orderSchema,
  createOrderDtoSchema,
  updateOrderDtoSchema,
  trackingInfoSchema,
} from '../models/ecommerce.models';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly api = inject(ApiService);

  // Dynamic state signals
  readonly orders = signal<Order[]>([]);
  readonly selectedOrder = signal<Order | null>(null);
  readonly trackingInfo = signal<TrackingInfo | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  loadOrders(filters?: { status?: string; search?: string }): void {
    this.isLoading.set(true);
    this.error.set(null);

    const params = {
      status: filters?.status !== 'all' ? filters?.status : undefined,
      search: filters?.search || undefined,
    };

    this.api
      .get<Order[]>('orders', { params, unwrapEnvelope: true })
      .pipe(
        map((rawOrders) => {
          const parsed = orderSchema.array().safeParse(rawOrders ?? []);
          return parsed.success ? parsed.data : (rawOrders ?? []);
        }),
        catchError((err: ApiError) => {
          this.error.set(err.message || 'Failed to load orders from API');
          this.isLoading.set(false);
          return throwError(() => err);
        })
      )
      .subscribe({
        next: (data) => {
          this.orders.set(data);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        },
      });
  }

  getOrderById(id: number): Observable<Order | null> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.api.get<Order>(`orders/${id}`, { unwrapEnvelope: true }).pipe(
      map((res) => {
        if (!res) return null;
        const parsed = orderSchema.safeParse(res);
        return parsed.success ? parsed.data : res;
      }),
      catchError((err: ApiError) => {
        this.error.set(err.message || `Order with ID ${id} not found`);
        this.isLoading.set(false);
        return throwError(() => err);
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
    this.error.set(null);

    return this.api.get<Order>(`orders/number/${num}`, { unwrapEnvelope: true }).pipe(
      map((res) => {
        if (!res) return null;
        const parsed = orderSchema.safeParse(res);
        return parsed.success ? parsed.data : res;
      }),
      catchError((err: ApiError) => {
        this.error.set(err.message || `Order ${num} not found`);
        this.isLoading.set(false);
        return throwError(() => err);
      }),
      tap((order) => {
        this.selectedOrder.set(order);
        this.isLoading.set(false);
      })
    );
  }

  getTracking(orderNumber: string): Observable<TrackingInfo | null> {
    const num = orderNumber.trim().toUpperCase();
    this.error.set(null);

    return this.api.get<TrackingInfo>(`orders/tracking/${num}`, { unwrapEnvelope: true }).pipe(
      map((res) => {
        if (!res) return null;
        const parsed = trackingInfoSchema.safeParse(res);
        return parsed.success ? parsed.data : res;
      }),
      catchError((err: ApiError) => {
        this.error.set(err.message || `Tracking info for ${num} not found`);
        return throwError(() => err);
      }),
      tap((info) => this.trackingInfo.set(info))
    );
  }

  createOrder(dto: CreateOrderDto): Observable<Order> {
    const validatedDto = createOrderDtoSchema.parse(dto);
    this.isLoading.set(true);
    this.error.set(null);

    return this.api.post<Order>('orders', validatedDto, { unwrapEnvelope: true }).pipe(
      map((raw) => {
        const parsed = orderSchema.safeParse(raw);
        return parsed.success ? parsed.data : raw;
      }),
      catchError((err: ApiError) => {
        this.error.set(err.message || 'Failed to create order');
        this.isLoading.set(false);
        return throwError(() => err);
      }),
      tap((created) => {
        this.orders.update((list) => [created, ...list]);
        this.isLoading.set(false);
      })
    );
  }

  updateOrder(id: number, dto: UpdateOrderDto): Observable<Order | null> {
    const validatedDto = updateOrderDtoSchema.parse(dto);
    this.error.set(null);

    return this.api.patch<Order>(`orders/${id}`, validatedDto, { unwrapEnvelope: true }).pipe(
      map((res) => {
        if (!res) return null;
        const parsed = orderSchema.safeParse(res);
        return parsed.success ? parsed.data : res;
      }),
      catchError((err: ApiError) => {
        this.error.set(err.message || 'Failed to update order');
        return throwError(() => err);
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
    this.error.set(null);

    return this.api.delete<unknown>(`orders/${id}`).pipe(
      map(() => true),
      catchError((err: ApiError) => {
        this.error.set(err.message || 'Failed to delete order');
        return throwError(() => err);
      }),
      tap(() => {
        this.orders.update((list) => list.filter((o) => o.id !== id));
        if (this.selectedOrder()?.id === id) {
          this.selectedOrder.set(null);
        }
      })
    );
  }
}
