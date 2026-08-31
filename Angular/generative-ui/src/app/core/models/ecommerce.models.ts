import { z } from 'zod';

// ==========================================
// Schema Metadata Registry
// ==========================================
export const ecommerceRegistry = z.registry<{ description: string }>();

// ==========================================
// Order Status
// ==========================================
export const orderStatusSchema = z
  .enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
  .describe('Fulfillment status of an order');
export type OrderStatus = z.infer<typeof orderStatusSchema>;

// ==========================================
// Order Item
// ==========================================
export const orderItemSchema = z.object({
  id: z.number().int().positive().optional().describe('Unique identifier of the order line item'),
  orderId: z.number().int().positive().optional().describe('ID of the parent order'),
  productName: z
    .string()
    .trim()
    .min(1, 'Product name is required')
    .describe('Name of the ordered product'),
  sku: z.string().trim().min(1, 'SKU is required').describe('Stock Keeping Unit code'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').describe('Purchased quantity'),
  unitPrice: z.string().describe('Unit price formatted as currency string'),
  imageUrl: z.string().nullable().optional().describe('Optional image asset URL'),
  createdAt: z
    .union([z.string(), z.date()])
    .optional()
    .describe('Timestamp when the item was created'),
});
export type OrderItem = z.infer<typeof orderItemSchema>;

// ==========================================
// Order
// ==========================================
export const orderSchema = z.object({
  id: z.number().int().describe('Primary key identifier of the order'),
  orderNumber: z.string().trim().min(1).describe('Alphanumeric order identifier (e.g. ORD-1001)'),
  customerName: z.string().trim().min(1).describe('Full name of the customer'),
  customerEmail: z.email().trim().describe('Customer contact email address'),
  status: orderStatusSchema,
  totalAmount: z.string().describe('Grand total formatted as decimal string'),
  currency: z.string().default('USD').describe('Three-letter currency code (e.g. USD)'),
  shippingAddress: z.string().trim().min(1).describe('Full delivery address'),
  carrier: z.string().trim().describe('Logistics carrier delivering the shipment'),
  trackingNumber: z.string().trim().optional().describe('Tracking number provided by the carrier'),
  estimatedDelivery: z
    .union([z.string(), z.date()])
    .optional()
    .describe('Estimated arrival date/time'),
  createdAt: z.union([z.string(), z.date()]).describe('Timestamp of order placement'),
  updatedAt: z.union([z.string(), z.date()]).describe('Timestamp of last order modification'),
  items: z.array(orderItemSchema).describe('Line items included in this order'),
});
export type Order = z.infer<typeof orderSchema>;

// ==========================================
// Create / Update Order DTOs
// ==========================================
export const createOrderItemDtoSchema = z.object({
  productName: z.string().trim().min(1, 'Product name is required').describe('Name of the product'),
  sku: z.string().trim().min(1, 'SKU is required').describe('SKU identifier'),
  quantity: z
    .number()
    .int()
    .min(1, 'Quantity must be at least 1')
    .describe('Item quantity ordered'),
  unitPrice: z.union([z.string(), z.number()]).describe('Unit price as number or string'),
  imageUrl: z.string().optional().describe('Optional thumbnail image URL'),
});
export type CreateOrderItemDto = z.infer<typeof createOrderItemDtoSchema>;

export const createOrderDtoSchema = z.object({
  orderNumber: z.string().trim().optional().describe('Optional custom order number'),
  customerName: z
    .string()
    .trim()
    .min(1, 'Customer name is required')
    .describe('Customer full name'),
  customerEmail: z
    .string()
    .trim()
    .email('Valid customer email is required')
    .describe('Customer email'),
  status: orderStatusSchema.optional(),
  shippingAddress: z
    .string()
    .trim()
    .min(1, 'Shipping address is required')
    .describe('Shipping address'),
  carrier: z.string().trim().optional().describe('Preferred carrier'),
  trackingNumber: z.string().trim().optional().describe('Tracking number if pre-assigned'),
  estimatedDelivery: z.string().optional().describe('Estimated delivery date string'),
  items: z
    .array(createOrderItemDtoSchema)
    .min(1, 'Order must have at least one item')
    .describe('List of items to order'),
});
export type CreateOrderDto = z.infer<typeof createOrderDtoSchema>;

export const updateOrderDtoSchema = z.object({
  customerName: z.string().trim().min(1).optional().describe('Updated customer full name'),
  customerEmail: z.email().trim().optional().describe('Updated customer email'),
  status: orderStatusSchema.optional().describe('Updated order status'),
  shippingAddress: z.string().trim().optional().describe('Updated shipping address'),
  carrier: z.string().trim().optional().describe('Updated shipping carrier'),
  trackingNumber: z.string().trim().optional().describe('Updated tracking number'),
  estimatedDelivery: z.string().optional().describe('Updated delivery date'),
});
export type UpdateOrderDto = z.infer<typeof updateOrderDtoSchema>;

// ==========================================
// Tracking Info
// ==========================================
export const trackingCheckpointSchema = z.object({
  status: z.string().describe('Milestone status description'),
  location: z.string().describe('Geographic checkpoint location'),
  timestamp: z.string().describe('Timestamp of checkpoint scan'),
  description: z.string().describe('Detailed status message'),
});
export type TrackingCheckpoint = z.infer<typeof trackingCheckpointSchema>;

export const trackingInfoSchema = z.object({
  orderNumber: z.string().describe('Order identifier'),
  carrier: z.string().describe('Carrier delivering the package'),
  trackingNumber: z.string().describe('Carrier tracking number'),
  status: orderStatusSchema,
  estimatedDelivery: z.string().describe('Estimated delivery time'),
  checkpoints: z.array(trackingCheckpointSchema).describe('Tracking history checkpoints'),
});
export type TrackingInfo = z.infer<typeof trackingInfoSchema>;

// ==========================================
// Support Tickets
// ==========================================
export const ticketTypeSchema = z
  .enum(['return', 'refund', 'cancellation', 'inquiry', 'shipping_delay'])
  .describe('Category of support ticket');
export type TicketType = z.infer<typeof ticketTypeSchema>;

export const ticketStatusSchema = z
  .enum(['open', 'in_progress', 'resolved', 'closed'])
  .describe('Support ticket status');
export type TicketStatus = z.infer<typeof ticketStatusSchema>;

export const ticketPrioritySchema = z
  .enum(['low', 'medium', 'high', 'urgent'])
  .describe('Support ticket priority');
export type TicketPriority = z.infer<typeof ticketPrioritySchema>;

export const supportTicketSchema = z.object({
  id: z.number().int().describe('Support ticket ID'),
  ticketNumber: z.string().describe('Unique ticket identifier (e.g. TKT-1001)'),
  orderNumber: z.string().describe('Associated order number'),
  customerEmail: z.email().trim().describe('Customer email address'),
  type: ticketTypeSchema,
  status: ticketStatusSchema,
  priority: ticketPrioritySchema,
  subject: z.string().min(1).describe('Ticket subject'),
  description: z.string().min(1).describe('Ticket problem description'),
  resolution: z.string().nullable().optional().describe('Resolution notes'),
  createdAt: z.union([z.string(), z.date()]).describe('Ticket creation timestamp'),
  updatedAt: z.union([z.string(), z.date()]).describe('Ticket update timestamp'),
});
export type SupportTicket = z.infer<typeof supportTicketSchema>;

export const createTicketDtoSchema = z.object({
  orderNumber: z
    .string()
    .trim()
    .min(1, 'Order number is required')
    .describe('Associated order number'),
  customerEmail: z
    .string()
    .trim()
    .email('Valid email is required')
    .describe('Contact email address'),
  type: ticketTypeSchema,
  status: ticketStatusSchema.optional(),
  priority: ticketPrioritySchema.optional(),
  subject: z
    .string()
    .trim()
    .min(3, 'Subject must be at least 3 characters')
    .describe('Ticket subject headline'),
  description: z
    .string()
    .trim()
    .min(5, 'Description must be at least 5 characters')
    .describe('Detailed issue description'),
});
export type CreateTicketDto = z.infer<typeof createTicketDtoSchema>;

export const updateTicketDtoSchema = z.object({
  status: ticketStatusSchema.optional().describe('Updated ticket status'),
  priority: ticketPrioritySchema.optional().describe('Updated ticket priority'),
  resolution: z.string().trim().optional().describe('Resolution summary'),
  subject: z.string().trim().min(3).optional().describe('Updated subject'),
  description: z.string().trim().min(5).optional().describe('Updated description'),
});
export type UpdateTicketDto = z.infer<typeof updateTicketDtoSchema>;

// ==========================================
// Generic API Response
// ==========================================
export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    status: z.enum(['success', 'error']).describe('API response status indicator'),
    data: dataSchema.optional().describe('Response payload data'),
    message: z.string().optional().describe('Optional message or error description'),
  });

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

// Register schemas in frontend metadata registry
ecommerceRegistry.add(orderSchema, { description: 'Complete order model schema' });
ecommerceRegistry.add(createOrderDtoSchema, { description: 'Create order request DTO schema' });
ecommerceRegistry.add(updateOrderDtoSchema, { description: 'Update order request DTO schema' });
ecommerceRegistry.add(trackingInfoSchema, {
  description: 'Order tracking and logistics info schema',
});
ecommerceRegistry.add(supportTicketSchema, { description: 'Complete support ticket model schema' });
ecommerceRegistry.add(createTicketDtoSchema, {
  description: 'Create support ticket request DTO schema',
});
ecommerceRegistry.add(updateTicketDtoSchema, {
  description: 'Update support ticket request DTO schema',
});

// ==========================================
// Parsing & Validation Helpers
// ==========================================
export function parseOrder(data: unknown): Order {
  return orderSchema.parse(data);
}

export function safeParseOrder(data: unknown) {
  return orderSchema.safeParse(data);
}

export function parseSupportTicket(data: unknown): SupportTicket {
  return supportTicketSchema.parse(data);
}

export function safeParseSupportTicket(data: unknown) {
  return supportTicketSchema.safeParse(data);
}

export function validateCreateOrder(data: unknown) {
  return createOrderDtoSchema.safeParse(data);
}

export function validateCreateTicket(data: unknown) {
  return createTicketDtoSchema.safeParse(data);
}
