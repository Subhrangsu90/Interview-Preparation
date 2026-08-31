import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, throwError, tap } from 'rxjs';
import {
  Order,
  CreateOrderDto,
  UpdateOrderDto,
  TrackingInfo,
  ApiResponse,
} from '../models/ecommerce.models';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/orders';

  // Dynamic state signals
  readonly orders = signal<Order[]>([]);
  readonly selectedOrder = signal<Order | null>(null);
  readonly trackingInfo = signal<TrackingInfo | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  loadOrders(filters?: { status?: string; search?: string }): void {
    this.isLoading.set(true);
    this.error.set(null);
    const params: Record<string, string> = {};
    if (filters?.status && filters.status !== 'all') params['status'] = filters.status;
    if (filters?.search) params['search'] = filters.search;

    this.http
      .get<ApiResponse<Order[]>>(this.baseUrl, { params })
      .pipe(
        map((res) => res.data ?? []),
        catchError((err) => {
          const errMsg = err?.error?.message || err?.message || 'Failed to load orders from API';
          this.error.set(errMsg);
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
    return this.http.get<ApiResponse<Order>>(`${this.baseUrl}/${id}`).pipe(
      map((res) => res.data ?? null),
      catchError((err) => {
        this.error.set(err?.error?.message || err?.message || `Order with ID ${id} not found`);
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
    return this.http.get<ApiResponse<Order>>(`${this.baseUrl}/number/${num}`).pipe(
      map((res) => res.data ?? null),
      catchError((err) => {
        this.error.set(err?.error?.message || err?.message || `Order ${num} not found`);
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
    return this.http.get<ApiResponse<TrackingInfo>>(`${this.baseUrl}/tracking/${num}`).pipe(
      map((res) => res.data ?? null),
      catchError((err) => {
        this.error.set(err?.error?.message || err?.message || `Tracking info for ${num} not found`);
        return throwError(() => err);
      }),
      tap((info) => this.trackingInfo.set(info))
    );
  }

  createOrder(dto: CreateOrderDto): Observable<Order> {
    this.isLoading.set(true);
    this.error.set(null);
    return this.http.post<ApiResponse<Order>>(this.baseUrl, dto).pipe(
      map((res) => res.data!),
      catchError((err) => {
        this.error.set(err?.error?.message || err?.message || 'Failed to create order');
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
    this.error.set(null);
    return this.http.patch<ApiResponse<Order>>(`${this.baseUrl}/${id}`, dto).pipe(
      map((res) => res.data ?? null),
      catchError((err) => {
        this.error.set(err?.error?.message || err?.message || 'Failed to update order');
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
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`).pipe(
      map(() => true),
      catchError((err) => {
        this.error.set(err?.error?.message || err?.message || 'Failed to delete order');
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
