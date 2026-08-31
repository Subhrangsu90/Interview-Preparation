import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, tap } from 'rxjs';
import {
  SupportTicket,
  CreateTicketDto,
  UpdateTicketDto,
  ApiResponse,
} from '../models/ecommerce.models';

const INITIAL_MOCK_TICKETS: SupportTicket[] = [
  {
    id: 1,
    ticketNumber: 'TKT-1042',
    orderNumber: 'ORD-9104',
    customerEmail: 'marcus.v@example.com',
    type: 'return',
    status: 'open',
    priority: 'medium',
    subject: 'Return Request: Headphones ear cushion defect',
    description: 'The right cushion seems loose out of the box. Requesting return and exchange for replacement.',
    resolution: null,
    createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    ticketNumber: 'TKT-1038',
    orderNumber: 'ORD-3312',
    customerEmail: 'elena.r@example.com',
    type: 'shipping_delay',
    status: 'in_progress',
    priority: 'high',
    subject: 'Delivery address update request before dispatch',
    description: 'Please update delivery suite number from Suite 100 to Suite 400 at 450 Bayview Ave.',
    resolution: 'Support agent contacted DHL logistics to append suite notes.',
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

@Injectable({
  providedIn: 'root',
})
export class SupportTicketService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/support-tickets';

  readonly tickets = signal<SupportTicket[]>(INITIAL_MOCK_TICKETS);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  loadTickets(filters?: { status?: string; orderNumber?: string }): void {
    this.isLoading.set(true);
    const params: Record<string, string> = {};
    if (filters?.status && filters.status !== 'all') params['status'] = filters.status;
    if (filters?.orderNumber) params['orderNumber'] = filters.orderNumber;

    this.http
      .get<ApiResponse<SupportTicket[]>>(this.baseUrl, { params })
      .pipe(
        map((res) => res.data ?? []),
        catchError(() => {
          let local = [...this.tickets()];
          if (filters?.status && filters.status !== 'all') {
            local = local.filter((t) => t.status === filters.status);
          }
          if (filters?.orderNumber) {
            const num = filters.orderNumber.toUpperCase();
            local = local.filter((t) => t.orderNumber.toUpperCase().includes(num));
          }
          return of(local);
        })
      )
      .subscribe({
        next: (data) => {
          this.tickets.set(data);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set(err?.message || 'Failed to load tickets');
          this.isLoading.set(false);
        },
      });
  }

  createTicket(dto: CreateTicketDto): Observable<SupportTicket> {
    return this.http.post<ApiResponse<SupportTicket>>(this.baseUrl, dto).pipe(
      map((res) => res.data!),
      catchError(() => {
        const newTicket: SupportTicket = {
          id: Date.now(),
          ticketNumber: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
          orderNumber: dto.orderNumber.toUpperCase(),
          customerEmail: dto.customerEmail,
          type: dto.type,
          status: dto.status || 'open',
          priority: dto.priority || 'medium',
          subject: dto.subject,
          description: dto.description,
          resolution: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return of(newTicket);
      }),
      tap((ticket) => {
        this.tickets.update((list) => [ticket, ...list]);
      })
    );
  }

  updateTicket(id: number, dto: UpdateTicketDto): Observable<SupportTicket | null> {
    return this.http.patch<ApiResponse<SupportTicket>>(`${this.baseUrl}/${id}`, dto).pipe(
      map((res) => res.data ?? null),
      catchError(() => {
        const current = this.tickets().find((t) => t.id === id);
        if (!current) return of(null);
        const updated: SupportTicket = { ...current, ...dto, updatedAt: new Date().toISOString() };
        return of(updated);
      }),
      tap((updated) => {
        if (updated) {
          this.tickets.update((list) => list.map((t) => (t.id === id ? updated : t)));
        }
      })
    );
  }

  deleteTicket(id: number): Observable<boolean> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`).pipe(
      map(() => true),
      catchError(() => of(true)),
      tap(() => {
        this.tickets.update((list) => list.filter((t) => t.id !== id));
      })
    );
  }
}
