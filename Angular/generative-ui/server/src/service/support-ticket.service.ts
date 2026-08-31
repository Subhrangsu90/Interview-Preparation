import { eq, desc, and } from 'drizzle-orm';
import { db } from '../db/index.js';
import { supportTickets, type SupportTicket } from '../db/schema.js';
import type { CreateTicketDto, UpdateTicketDto } from '../schemas/support-ticket.schema.js';

export class SupportTicketService {
  async getAllTickets(filters?: { status?: string; orderNumber?: string }): Promise<SupportTicket[]> {
    const conditions = [];

    if (filters?.status && filters.status !== 'all') {
      conditions.push(eq(supportTickets.status, filters.status.toLowerCase()));
    }

    if (filters?.orderNumber && filters.orderNumber.trim()) {
      conditions.push(eq(supportTickets.orderNumber, filters.orderNumber.trim().toUpperCase()));
    }

    let query = db.select().from(supportTickets).orderBy(desc(supportTickets.createdAt));
    if (conditions.length > 0) {
      query = db
        .select()
        .from(supportTickets)
        .where(and(...conditions))
        .orderBy(desc(supportTickets.createdAt)) as typeof query;
    }

    return await query;
  }

  async getTicketById(id: number): Promise<SupportTicket | null> {
    const result = await db
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.id, id))
      .limit(1);

    return result[0] ?? null;
  }

  async createTicket(dto: CreateTicketDto): Promise<SupportTicket> {
    const generatedTicketNumber = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;

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
  }

  async updateTicket(id: number, dto: UpdateTicketDto): Promise<SupportTicket | null> {
    const updatedRows = await db
      .update(supportTickets)
      .set({
        ...dto,
        updatedAt: new Date(),
      })
      .where(eq(supportTickets.id, id))
      .returning();

    return updatedRows[0] ?? null;
  }

  async deleteTicket(id: number): Promise<boolean> {
    const deletedRows = await db
      .delete(supportTickets)
      .where(eq(supportTickets.id, id))
      .returning();

    return deletedRows.length > 0;
  }
}

export const supportTicketService = new SupportTicketService();
