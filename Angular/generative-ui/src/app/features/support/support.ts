import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, TitleCasePipe, UpperCasePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SupportTicketService } from '../../core/services/support-ticket.service';
import {
  SupportTicket,
  TicketStatus,
  TicketType,
} from '../../core/models/ecommerce.models';
import { CreateTicketDialog } from './create-ticket-dialog/create-ticket-dialog';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [
    CommonModule,
    TitleCasePipe,
    UpperCasePipe,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatProgressBarModule,
    MatDialogModule,
  ],
  templateUrl: './support.html',
  styleUrl: './support.scss',
})
export class SupportComponent implements OnInit {
  private readonly ticketService = inject(SupportTicketService);
  private readonly dialog = inject(MatDialog);
  private readonly route = inject(ActivatedRoute);

  readonly statusTabs: string[] = ['all', 'open', 'in_progress', 'resolved', 'closed'];

  readonly searchQuery = signal<string>('');
  readonly selectedStatus = signal<string>('all');

  readonly allTickets = this.ticketService.tickets;
  readonly isLoading = this.ticketService.isLoading;
  readonly error = this.ticketService.error;

  readonly filteredTickets = computed(() => {
    const list = this.allTickets();
    const q = this.searchQuery().toLowerCase().trim();
    const status = this.selectedStatus();

    return list.filter((ticket) => {
      const matchesStatus = status === 'all' || ticket.status === status;
      const matchesQuery =
        !q ||
        ticket.orderNumber.toLowerCase().includes(q) ||
        ticket.ticketNumber.toLowerCase().includes(q) ||
        ticket.customerEmail.toLowerCase().includes(q) ||
        ticket.subject.toLowerCase().includes(q);

      return matchesStatus && matchesQuery;
    });
  });

  readonly openTicketsCount = computed(
    () => this.allTickets().filter((t) => t.status === 'open').length
  );
  readonly inProgressCount = computed(
    () => this.allTickets().filter((t) => t.status === 'in_progress').length
  );
  readonly resolvedCount = computed(
    () => this.allTickets().filter((t) => t.status === 'resolved').length
  );
  readonly returnRequestsCount = computed(
    () => this.allTickets().filter((t) => t.type === 'return' || t.type === 'refund').length
  );

  ngOnInit(): void {
    this.ticketService.loadTickets();

    // Check if routed with queryParams (e.g. from Order Detail "Request Return")
    this.route.queryParams.subscribe((params) => {
      if (params['orderNumber']) {
        this.openCreateTicketDialog({
          orderNumber: params['orderNumber'],
          customerEmail: params['email'] || '',
          type: (params['type'] as TicketType) || 'return',
        });
      }
    });
  }

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
  }

  formatType(type: TicketType): string {
    switch (type) {
      case 'return':
        return 'Product Return';
      case 'refund':
        return 'Refund Request';
      case 'cancellation':
        return 'Order Cancel';
      case 'shipping_delay':
        return 'Shipping Delay';
      case 'inquiry':
        return 'General Inquiry';
      default:
        return type;
    }
  }

  formatDate(dateVal: string | Date | undefined): string {
    if (!dateVal) return 'N/A';
    return new Date(dateVal).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  openCreateTicketDialog(prefill?: { orderNumber?: string; customerEmail?: string; type?: TicketType }): void {
    const dialogRef = this.dialog.open(CreateTicketDialog, {
      width: '560px',
      data: prefill,
    });

    dialogRef.afterClosed().subscribe((res) => {
      if (res) {
        this.ticketService.createTicket(res).subscribe();
      }
    });
  }

  updateTicketStatus(ticket: SupportTicket, newStatus: TicketStatus): void {
    let resolution: string | undefined;
    if (newStatus === 'resolved') {
      resolution = prompt('Enter resolution notes (optional):') || 'Resolved by support agent.';
    }

    this.ticketService
      .updateTicket(ticket.id, {
        status: newStatus,
        resolution: resolution !== undefined ? resolution : ticket.resolution || undefined,
      })
      .subscribe();
  }

  deleteTicket(ticket: SupportTicket): void {
    if (confirm(`Delete ticket ${ticket.ticketNumber}?`)) {
      this.ticketService.deleteTicket(ticket.id).subscribe();
    }
  }
}
