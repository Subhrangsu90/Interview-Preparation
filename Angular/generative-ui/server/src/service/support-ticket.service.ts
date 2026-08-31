import { eq, desc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { supportTickets, type SupportTicket } from '../db/schema.js';
import type { CreateTicketDto, UpdateTicketDto } from '../schemas/support-ticket.schema.js';

let mockTickets: SupportTicket[] = [
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
    createdAt: new Date(Date.now() - 12 * 3600 * 1000),
    updatedAt: new Date(),
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
    createdAt: new Date(Date.now() - 3 * 3600 * 1000),
    updatedAt: new Date(),
  },
];

export class SupportTicketService {
  async getAllTickets(filters?: { status?: string; orderNumber?: string }): Promise<SupportTicket[]> {
    try {
      const dbTickets = await db.select().from(supportTickets).orderBy(desc(supportTickets.createdAt));
      if (dbTickets.length > 0) {
        return this.applyFilters(dbTickets, filters);
      }
    } catch {
      // Memory fallback
    }
    return this.applyFilters(mockTickets, filters);
  }

  async getTicketById(id: number): Promise<SupportTicket | null> {
    try {
      const result = await db.select().from(supportTickets).where(eq(supportTickets.id, id)).limit(1);
      if (result.length > 0) return result[0];
    } catch {
      // Memory fallback
    }
    return mockTickets.find((t) => t.id === id) ?? null;
  }

  async createTicket(dto: CreateTicketDto): Promise<SupportTicket> {
    const generatedTicketNumber = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      const createdRows = await db
        .insert(supportTickets)
        .values({
          ticketNumber: generatedTicketNumber,
          orderNumber: dto.orderNumber.toUpperCase(),
          customerEmail: dto.customerEmail,
          type: dto.type,
          status: dto.status ?? 'open',
          priority: dto.priority ?? 'medium',
          subject: dto.subject,
          description: dto.description,
        })
        .returning();

      return createdRows[0];
    } catch {
      const nextId = mockTickets.length > 0 ? Math.max(...mockTickets.map((t) => t.id)) + 1 : 1;
      const newTicket: SupportTicket = {
        id: nextId,
        ticketNumber: generatedTicketNumber,
        orderNumber: dto.orderNumber.toUpperCase(),
        customerEmail: dto.customerEmail,
        type: dto.type,
        status: dto.status ?? 'open',
        priority: dto.priority ?? 'medium',
        subject: dto.subject,
        description: dto.description,
        resolution: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockTickets.unshift(newTicket);
      return newTicket;
    }
  }

  async updateTicket(id: number, dto: UpdateTicketDto): Promise<SupportTicket | null> {
    try {
      const updatedRows = await db
        .update(supportTickets)
        .set({
          ...dto,
          updatedAt: new Date(),
        })
        .where(eq(supportTickets.id, id))
        .returning();

      if (updatedRows.length > 0) return updatedRows[0];
    } catch {
      // Memory fallback
    }

    const index = mockTickets.findIndex((t) => t.id === id);
    if (index === -1) return null;

    mockTickets[index] = {
      ...mockTickets[index],
      ...dto,
      updatedAt: new Date(),
    };
    return mockTickets[index];
  }

  async deleteTicket(id: number): Promise<boolean> {
    try {
      const deletedRows = await db.delete(supportTickets).where(eq(supportTickets.id, id)).returning();
      if (deletedRows.length > 0) return true;
    } catch {
      // Memory fallback
    }

    const prevLength = mockTickets.length;
    mockTickets = mockTickets.filter((t) => t.id !== id);
    return mockTickets.length < prevLength;
  }

  private applyFilters(list: SupportTicket[], filters?: { status?: string; orderNumber?: string }): SupportTicket[] {
    let result = [...list];
    if (filters?.status) {
      const s = filters.status.toLowerCase();
      result = result.filter((t) => t.status.toLowerCase() === s);
    }
    if (filters?.orderNumber) {
      const o = filters.orderNumber.toUpperCase();
      result = result.filter((t) => t.orderNumber.toUpperCase().includes(o));
    }
    return result;
  }
}

export const supportTicketService = new SupportTicketService();
