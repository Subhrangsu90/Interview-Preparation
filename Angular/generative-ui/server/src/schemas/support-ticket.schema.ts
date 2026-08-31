import { z } from 'zod';

export const createTicketSchema = z.object({
  orderNumber: z.string().trim().min(1, 'Order number is required'),
  customerEmail: z.string().trim().email('Invalid email address'),
  type: z.enum(['return', 'refund', 'cancellation', 'inquiry', 'shipping_delay']),
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']).default('open'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  subject: z.string().trim().min(3, 'Subject must be at least 3 characters'),
  description: z.string().trim().min(5, 'Description must be at least 5 characters'),
});

export const updateTicketSchema = z.object({
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  resolution: z.string().trim().optional(),
  subject: z.string().trim().min(3).optional(),
  description: z.string().trim().min(5).optional(),
});

export const ticketIdParamSchema = z.object({
  id: z.coerce.number().int().positive({ message: 'Ticket ID must be a positive integer' }),
});

export type CreateTicketDto = z.infer<typeof createTicketSchema>;
export type UpdateTicketDto = z.infer<typeof updateTicketSchema>;
