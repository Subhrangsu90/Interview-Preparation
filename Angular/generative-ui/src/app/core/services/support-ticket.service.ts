import { Injectable, inject, signal } from '@angular/core';
import { catchError, map, Observable, throwError, tap } from 'rxjs';
import { ApiService, ApiError } from '@core/api';
import {
  SupportTicket,
  CreateTicketDto,
  UpdateTicketDto,
  supportTicketSchema,
  createTicketDtoSchema,
  updateTicketDtoSchema,
} from '../models/ecommerce.models';

@Injectable({
  providedIn: 'root',
})
export class SupportTicketService {
  private readonly api = inject(ApiService);

  // Dynamic state signals
  readonly tickets = signal<SupportTicket[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  loadTickets(filters?: { status?: string; orderNumber?: string }): void {
    this.isLoading.set(true);
    this.error.set(null);

    const params = {
      status: filters?.status !== 'all' ? filters?.status : undefined,
      orderNumber: filters?.orderNumber || undefined,
    };

    this.api
      .get<SupportTicket[]>('support-tickets', { params, unwrapEnvelope: true })
      .pipe(
        map((rawTickets) => {
          const parsed = supportTicketSchema.array().safeParse(rawTickets ?? []);
          return parsed.success ? parsed.data : (rawTickets ?? []);
        }),
        catchError((err: ApiError) => {
          this.error.set(err.message || 'Failed to load support tickets');
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
    const validatedDto = createTicketDtoSchema.parse(dto);
    this.isLoading.set(true);
    this.error.set(null);

    return this.api
      .post<SupportTicket>('support-tickets', validatedDto, { unwrapEnvelope: true })
      .pipe(
        map((raw) => {
          const parsed = supportTicketSchema.safeParse(raw);
          return parsed.success ? parsed.data : raw;
        }),
        catchError((err: ApiError) => {
          this.error.set(err.message || 'Failed to create support ticket');
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
    const validatedDto = updateTicketDtoSchema.parse(dto);
    this.error.set(null);

    return this.api
      .patch<SupportTicket>(`support-tickets/${id}`, validatedDto, { unwrapEnvelope: true })
      .pipe(
        map((res) => {
          if (!res) return null;
          const parsed = supportTicketSchema.safeParse(res);
          return parsed.success ? parsed.data : res;
        }),
        catchError((err: ApiError) => {
          this.error.set(err.message || 'Failed to update ticket');
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

    return this.api.delete<unknown>(`support-tickets/${id}`).pipe(
      map(() => true),
      catchError((err: ApiError) => {
        this.error.set(err.message || 'Failed to delete ticket');
        return throwError(() => err);
      }),
      tap(() => {
        this.tickets.update((list) => list.filter((t) => t.id !== id));
      })
    );
  }
}
