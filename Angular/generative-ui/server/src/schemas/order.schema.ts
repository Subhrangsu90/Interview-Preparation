import { z } from 'zod';

// ==========================================
// Schema Metadata Registry
// ==========================================
export const orderRegistry = z.registry<{ description: string }>();

// ==========================================
// Order Schemas with Descriptions
// ==========================================
export const orderItemInputSchema = z.object({
  productName: z.string().trim().min(1, 'Product name is required').describe('Name of the product'),
  sku: z.string().trim().min(1, 'SKU is required').describe('Stock Keeping Unit (SKU) identifier'),
  quantity: z
    .number()
    .int()
    .positive('Quantity must be greater than 0')
    .default(1)
    .describe('Quantity of items ordered'),
  unitPrice: z
    .union([z.number(), z.string()])
    .transform((val) => String(Number(val).toFixed(2)))
    .describe('Price per unit formatted as a decimal string'),
  imageUrl: z.string().url().optional().or(z.literal('')).describe('Optional URL to product image'),
});

export const createOrderSchema = z.object({
  orderNumber: z
    .string()
    .trim()
    .optional()
    .describe('Unique order identifier (auto-generated if omitted)'),
  customerName: z
    .string()
    .trim()
    .min(1, 'Customer name is required')
    .describe('Full name of the customer placing the order'),
  customerEmail: z
    .string()
    .trim()
    .email('Invalid customer email address')
    .describe('Contact email address of the customer'),
  status: z
    .enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
    .default('processing')
    .describe('Initial fulfillment status of the order'),
  shippingAddress: z
    .string()
    .trim()
    .min(5, 'Shipping address is required')
    .describe('Full destination shipping address'),
  carrier: z
    .string()
    .trim()
    .default('FedEx')
    .describe('Shipping carrier assigned to deliver the order'),
  trackingNumber: z.string().trim().optional().describe('Tracking number issued by the carrier'),
  estimatedDelivery: z
    .string()
    .optional()
    .or(z.date())
    .describe('Estimated delivery date and time'),
  items: z
    .array(orderItemInputSchema)
    .min(1, 'Order must contain at least one item')
    .describe('List of items included in this order'),
});

export const updateOrderSchema = z.object({
  customerName: z.string().trim().min(1).optional().describe('Updated customer full name'),
  customerEmail: z.email().trim().optional().describe('Updated customer email'),
  status: z
    .enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
    .optional()
    .describe('Updated order fulfillment status'),
  shippingAddress: z.string().trim().optional().describe('Updated destination shipping address'),
  carrier: z.string().trim().optional().describe('Updated shipping carrier'),
  trackingNumber: z.string().trim().optional().describe('Updated carrier tracking number'),
  estimatedDelivery: z
    .union([z.string(), z.date()])
    .optional()
    .describe('Updated estimated delivery date'),
});

export const orderIdParamSchema = z.object({
  id: z.coerce
    .number()
    .int()
    .positive({ message: 'Order ID must be a positive integer' })
    .describe('Unique numeric primary ID of the order'),
});

export const orderNumberParamSchema = z.object({
  orderNumber: z
    .string()
    .trim()
    .min(1, 'Order number is required')
    .describe('Unique alphanumeric order number (e.g. ORD-1001)'),
});

export const orderQuerySchema = z.object({
  status: z.string().trim().optional().describe('Optional filter by order fulfillment status'),
  search: z
    .string()
    .trim()
    .optional()
    .describe(
      'Optional search query matching order number, customer name, email, or tracking number'
    ),
});

// Register schemas with descriptions in the registry
orderRegistry.add(orderItemInputSchema, {
  description: 'Schema for validating individual order item input payloads',
});
orderRegistry.add(createOrderSchema, {
  description: 'Schema for validating incoming order creation requests',
});
orderRegistry.add(updateOrderSchema, {
  description: 'Schema for validating partial updates to existing orders',
});
orderRegistry.add(orderIdParamSchema, {
  description: 'Schema for validating numeric order ID route parameters',
});
orderRegistry.add(orderNumberParamSchema, {
  description: 'Schema for validating alphanumeric order number route parameters',
});
orderRegistry.add(orderQuerySchema, {
  description: 'Schema for validating order search and filter query parameters',
});

export type CreateOrderDto = z.infer<typeof createOrderSchema>;
export type UpdateOrderDto = z.infer<typeof updateOrderSchema>;
export type OrderItemInput = z.infer<typeof orderItemInputSchema>;
export type OrderQuery = z.infer<typeof orderQuerySchema>;
