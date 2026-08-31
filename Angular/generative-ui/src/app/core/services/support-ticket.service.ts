import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, throwError, tap } from 'rxjs';
import {
  SupportTicket,
  CreateTicketDto,
  UpdateTicketDto,
  ApiResponse,
} from '../models/ecommerce.models';

@Injectable({
  providedIn: 'root',
})
export class SupportTicketService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/support-tickets';

  // Dynamic state signals
  readonly tickets = signal<SupportTicket[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  loadTickets(filters?: { status?: string; orderNumber?: string }): void {
    this.isLoading.set(true);
    this.error.set(null);
    const params: Record<string, string> = {};
    if (filters?.status && filters.status !== 'all') params['status'] = filters.status;
    if (filters?.orderNumber) params['orderNumber'] = filters.orderNumber;

    this.http
      .get<ApiResponse<SupportTicket[]>>(this.baseUrl, { params })
      .pipe(
        map((res) => res.data ?? []),
        catchError((err) => {
          const errMsg = err?.error?.message || err?.message || 'Failed to load support tickets';
          this.error.set(errMsg);
          this.isLoading.set(false);
          return throwError(() => err);
        })
      )
      .subscribe({
        next: (data) => {
          this.tickets.set(data);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        },
      });
  }

  createTicket(dto: CreateTicketDto): Observable<SupportTicket> {
    this.isLoading.set(true);
    this.error.set(null);
    return this.http.post<ApiResponse<SupportTicket>>(this.baseUrl, dto).pipe(
      map((res) => res.data!),
      catchError((err) => {
        this.error.set(err?.error?.message || err?.message || 'Failed to create support ticket');
        this.isLoading.set(false);
        return throwError(() => err);
      }),
      tap((ticket) => {
        this.tickets.update((list) => [ticket, ...list]);
        this.isLoading.set(false);
      })
    );
  }

  updateTicket(id: number, dto: UpdateTicketDto): Observable<SupportTicket | null> {
    this.error.set(null);
    return this.http.patch<ApiResponse<SupportTicket>>(`${this.baseUrl}/${id}`, dto).pipe(
      map((res) => res.data ?? null),
      catchError((err) => {
        this.error.set(err?.error?.message || err?.message || 'Failed to update ticket');
        return throwError(() => err);
      }),
      tap((updated) => {
        if (updated) {
          this.tickets.update((list) => list.map((t) => (t.id === id ? updated : t)));
        }
      })
    );
  }

  deleteTicket(id: number): Observable<boolean> {
    this.error.set(null);
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`).pipe(
      map(() => true),
      catchError((err) => {
        this.error.set(err?.error?.message || err?.message || 'Failed to delete ticket');
        return throwError(() => err);
      }),
      tap(() => {
        this.tickets.update((list) => list.filter((t) => t.id !== id));
      })
    );
  }
}
