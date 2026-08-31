import { pgTable, serial, text, varchar, timestamp, integer, numeric } from 'drizzle-orm/pg-core';
import { z } from 'zod';

// ==========================================
// Orders Table & Schemas
// ==========================================
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  orderNumber: varchar('order_number', { length: 50 }).notNull().unique(),
  customerName: varchar('customer_name', { length: 255 }).notNull(),
  customerEmail: varchar('customer_email', { length: 255 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('processing'), // pending, processing, shipped, delivered, cancelled
  totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull().default('0.00'),
  currency: varchar('currency', { length: 10 }).notNull().default('USD'),
  shippingAddress: text('shipping_address').notNull(),
  carrier: varchar('carrier', { length: 100 }).default('FedEx'),
  trackingNumber: varchar('tracking_number', { length: 100 }),
  estimatedDelivery: timestamp('estimated_delivery'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

export const dbOrderSelectSchema = z.object({
  id: z.number().int().positive(),
  orderNumber: z.string().min(1),
  customerName: z.string().min(1),
  customerEmail: z.email(),
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
  totalAmount: z.string(),
  currency: z.string().default('USD'),
  shippingAddress: z.string().min(1),
  carrier: z.string().nullable().optional(),
  trackingNumber: z.string().nullable().optional(),
  estimatedDelivery: z.date().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const dbOrderInsertSchema = z.object({
  orderNumber: z.string().trim().min(1),
  customerName: z.string().trim().min(1),
  customerEmail: z.email().trim(),
  status: z
    .enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
    .default('processing'),
  totalAmount: z.string().default('0.00'),
  currency: z.string().default('USD'),
  shippingAddress: z.string().trim().min(1),
  carrier: z.string().trim().default('FedEx'),
  trackingNumber: z.string().trim().optional(),
  estimatedDelivery: z.date().optional(),
});

export type DbOrderSelect = z.infer<typeof dbOrderSelectSchema>;
export type DbOrderInsert = z.infer<typeof dbOrderInsertSchema>;

// ==========================================
// Order Items Table & Schemas
// ==========================================
export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id')
    .references(() => orders.id, { onDelete: 'cascade' })
    .notNull(),
  productName: varchar('product_name', { length: 255 }).notNull(),
  sku: varchar('sku', { length: 100 }).notNull(),
  quantity: integer('quantity').notNull().default(1),
  unitPrice: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;

export const dbOrderItemSelectSchema = z.object({
  id: z.number().int().positive(),
  orderId: z.number().int().positive(),
  productName: z.string().min(1),
  sku: z.string().min(1),
  quantity: z.number().int().min(1),
  unitPrice: z.string(),
  imageUrl: z.string().nullable().optional(),
  createdAt: z.date(),
});

export const dbOrderItemInsertSchema = z.object({
  orderId: z.number().int().positive(),
  productName: z.string().trim().min(1),
  sku: z.string().trim().min(1),
  quantity: z.number().int().min(1).default(1),
  unitPrice: z.string(),
  imageUrl: z.string().nullable().optional(),
});

export type DbOrderItemSelect = z.infer<typeof dbOrderItemSelectSchema>;
export type DbOrderItemInsert = z.infer<typeof dbOrderItemInsertSchema>;

// ==========================================
// Support Tickets Table & Schemas
// ==========================================
export const supportTickets = pgTable('support_tickets', {
  id: serial('id').primaryKey(),
  ticketNumber: varchar('ticket_number', { length: 50 }).notNull().unique(),
  orderNumber: varchar('order_number', { length: 50 }).notNull(),
  customerEmail: varchar('customer_email', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // return, refund, cancellation, inquiry, shipping_delay
  status: varchar('status', { length: 50 }).notNull().default('open'), // open, in_progress, resolved, closed
  priority: varchar('priority', { length: 50 }).notNull().default('medium'), // low, medium, high, urgent
  subject: varchar('subject', { length: 255 }).notNull(),
  description: text('description').notNull(),
  resolution: text('resolution'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type SupportTicket = typeof supportTickets.$inferSelect;
export type NewSupportTicket = typeof supportTickets.$inferInsert;

export const dbSupportTicketSelectSchema = z.object({
  id: z.number().int().positive(),
  ticketNumber: z.string().min(1),
  orderNumber: z.string().min(1),
  customerEmail: z.email(),
  type: z.enum(['return', 'refund', 'cancellation', 'inquiry', 'shipping_delay']),
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  subject: z.string().min(1),
  description: z.string().min(1),
  resolution: z.string().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const dbSupportTicketInsertSchema = z.object({
  ticketNumber: z.string().trim().min(1),
  orderNumber: z.string().trim().min(1),
  customerEmail: z.email().trim(),
  type: z.enum(['return', 'refund', 'cancellation', 'inquiry', 'shipping_delay']),
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']).default('open'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  subject: z.string().trim().min(1),
  description: z.string().trim().min(1),
  resolution: z.string().trim().nullable().optional(),
});

export type DbSupportTicketSelect = z.infer<typeof dbSupportTicketSelectSchema>;
export type DbSupportTicketInsert = z.infer<typeof dbSupportTicketInsertSchema>;
