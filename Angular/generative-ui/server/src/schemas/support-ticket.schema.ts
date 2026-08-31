import { z } from 'zod';

// ==========================================
// Schema Metadata Registry
// ==========================================
export const supportTicketRegistry = z.registry<{ description: string }>();

// ==========================================
// Support Ticket Schemas with Descriptions
// ==========================================
export const createTicketSchema = z.object({
  orderNumber: z
    .string()
    .trim()
    .min(1, 'Order number is required')
    .describe('Order number associated with the support ticket (e.g. ORD-1001)'),
  customerEmail: z
    .string()
    .trim()
    .email('Invalid email address')
    .describe('Contact email address of the customer creating the ticket'),
  type: z
    .enum(['return', 'refund', 'cancellation', 'inquiry', 'shipping_delay'])
    .describe('Category of the support request'),
  status: z
    .enum(['open', 'in_progress', 'resolved', 'closed'])
    .default('open')
    .describe('Current lifecycle status of the support ticket'),
  priority: z
    .enum(['low', 'medium', 'high', 'urgent'])
    .default('medium')
    .describe('Urgency level assigned to resolve the issue'),
  subject: z
    .string()
    .trim()
    .min(3, 'Subject must be at least 3 characters')
    .describe('Brief headline or summary of the customer issue'),
  description: z
    .string()
    .trim()
    .min(5, 'Description must be at least 5 characters')
    .describe('Detailed explanation of the issue or inquiry'),
});

export const updateTicketSchema = z.object({
  status: z
    .enum(['open', 'in_progress', 'resolved', 'closed'])
    .optional()
    .describe('Updated lifecycle status of the ticket'),
  priority: z
    .enum(['low', 'medium', 'high', 'urgent'])
    .optional()
    .describe('Updated priority level of the ticket'),
  resolution: z
    .string()
    .trim()
    .optional()
    .describe('Resolution details or outcome recorded by support agents'),
  subject: z.string().trim().min(3).optional().describe('Updated subject line for the ticket'),
  description: z
    .string()
    .trim()
    .min(5)
    .optional()
    .describe('Updated detailed explanation of the ticket'),
});

export const ticketIdParamSchema = z.object({
  id: z.coerce
    .number()
    .int()
    .positive({ message: 'Ticket ID must be a positive integer' })
    .describe('Unique numeric primary ID of the support ticket'),
});

export const ticketQuerySchema = z.object({
  status: z
    .string()
    .trim()
    .optional()
    .describe('Filter support tickets by status (e.g. open, in_progress, resolved)'),
  orderNumber: z
    .string()
    .trim()
    .optional()
    .describe('Filter support tickets by related order number'),
});

// Register schemas with descriptions in the registry
supportTicketRegistry.add(createTicketSchema, {
  description: 'Schema for validating incoming support ticket creation requests',
});
supportTicketRegistry.add(updateTicketSchema, {
  description: 'Schema for validating partial updates to existing support tickets',
});
supportTicketRegistry.add(ticketIdParamSchema, {
  description: 'Schema for validating numeric ticket ID route parameters',
});
supportTicketRegistry.add(ticketQuerySchema, {
  description: 'Schema for validating support ticket search and filter query parameters',
});

export type CreateTicketDto = z.infer<typeof createTicketSchema>;
export type UpdateTicketDto = z.infer<typeof updateTicketSchema>;
export type TicketQuery = z.infer<typeof ticketQuerySchema>;
