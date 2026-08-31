import { z } from 'zod';

export const orderItemInputSchema = z.object({
  productName: z.string().trim().min(1, 'Product name is required'),
  sku: z.string().trim().min(1, 'SKU is required'),
  quantity: z.number().int().positive('Quantity must be greater than 0').default(1),
  unitPrice: z.union([z.number(), z.string()]).transform((val) => String(Number(val).toFixed(2))),
  imageUrl: z.string().url().optional().or(z.literal('')),
});

export const createOrderSchema = z.object({
  orderNumber: z.string().trim().optional(), // Auto-generated if omitted
  customerName: z.string().trim().min(1, 'Customer name is required'),
  customerEmail: z.string().trim().email('Invalid customer email address'),
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).default('processing'),
  shippingAddress: z.string().trim().min(5, 'Shipping address is required'),
  carrier: z.string().trim().default('FedEx'),
  trackingNumber: z.string().trim().optional(),
  estimatedDelivery: z.string().optional().or(z.date()),
  items: z.array(orderItemInputSchema).min(1, 'Order must contain at least one item'),
});

export const updateOrderSchema = z.object({
  customerName: z.string().trim().min(1).optional(),
  customerEmail: z.string().trim().email().optional(),
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).optional(),
  shippingAddress: z.string().trim().optional(),
  carrier: z.string().trim().optional(),
  trackingNumber: z.string().trim().optional(),
  estimatedDelivery: z.union([z.string(), z.date()]).optional(),
});

export const orderIdParamSchema = z.object({
  id: z.coerce.number().int().positive({ message: 'Order ID must be a positive integer' }),
});

export const orderNumberParamSchema = z.object({
  orderNumber: z.string().trim().min(1, 'Order number is required'),
});

export type CreateOrderDto = z.infer<typeof createOrderSchema>;
export type UpdateOrderDto = z.infer<typeof updateOrderSchema>;
export type OrderItemInput = z.infer<typeof orderItemInputSchema>;
