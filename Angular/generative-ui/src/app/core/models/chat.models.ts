import { z } from 'zod';

// ==========================================
// Model Enums & Definitions
// ==========================================
export const modelIdSchema = z
  .enum(['gemini-flash', 'gemini-pro', 'chatgpt-4o'])
  .describe('Unique identifier of the AI reasoning model');
export type ModelId = z.infer<typeof modelIdSchema>;

export const messageRoleSchema = z
  .enum(['user', 'assistant', 'system'])
  .describe('Origin of the chat message');
export type MessageRole = z.infer<typeof messageRoleSchema>;

export const aiModelOptionSchema = z.object({
  id: modelIdSchema,
  name: z.string().describe('Display name of the model'),
  provider: z.enum(['Google Gemini', 'OpenAI']).describe('Provider organization'),
  badge: z.string().describe('Short capability pill text'),
  description: z.string().describe('Detailed purpose description'),
  icon: z.string().describe('Material icon symbol'),
});
export type AiModelOption = z.infer<typeof aiModelOptionSchema>;

// ==========================================
// Generative UI Widget Payloads
// ==========================================
export const orderWidgetItemSchema = z.object({
  name: z.string().describe('Product item name'),
  quantity: z.number().int().positive().describe('Quantity ordered'),
  price: z.number().nonnegative().describe('Unit price'),
});

export const orderWidgetPayloadSchema = z.object({
  orderNumber: z.string().describe('Order identifier code'),
  customerName: z.string().describe('Customer full name'),
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
  totalAmount: z.number().describe('Total monetary value'),
  trackingNumber: z.string().describe('Carrier tracking identifier'),
  carrier: z.string().describe('Logistics provider'),
  estimatedDelivery: z.string().describe('Estimated arrival timeframe'),
  items: z.array(orderWidgetItemSchema).describe('Line items included'),
});
export type OrderWidgetPayload = z.infer<typeof orderWidgetPayloadSchema>;

export const returnWidgetPayloadSchema = z.object({
  orderNumber: z.string().optional().describe('Target order number'),
  eligibleUntil: z.string().optional().describe('Return policy window limit'),
  refundEstimate: z.number().optional().describe('Estimated refund sum'),
  steps: z.array(z.string()).describe('Process guidelines list'),
  supportDeskRoute: z.string().default('/support').describe('In-app route to support'),
});
export type ReturnWidgetPayload = z.infer<typeof returnWidgetPayloadSchema>;

export const metricsWidgetPayloadSchema = z.object({
  period: z.string().describe('Timespan measured'),
  totalOrders: z.number().int().nonnegative().describe('Count of orders'),
  totalSpent: z.number().nonnegative().describe('Sum spent in currency'),
  activeShipments: z.number().int().nonnegative().describe('In-transit shipment count'),
  resolvedInquiries: z.number().int().nonnegative().describe('Closed ticket count'),
});
export type MetricsWidgetPayload = z.infer<typeof metricsWidgetPayloadSchema>;

export const generativeWidgetSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('order_status'), data: orderWidgetPayloadSchema }),
  z.object({ type: z.literal('return_guide'), data: returnWidgetPayloadSchema }),
  z.object({ type: z.literal('metrics_summary'), data: metricsWidgetPayloadSchema }),
]);
export type GenerativeWidget = z.infer<typeof generativeWidgetSchema>;

// ==========================================
// Chat Messages & Sessions
// ==========================================
export const chatMessageSchema = z.object({
  id: z.string().describe('Unique message identifier'),
  role: messageRoleSchema,
  content: z.string().describe('Text body of message'),
  timestamp: z.number().describe('Epoch millisecond timestamp'),
  isStreaming: z.boolean().optional().describe('Flag indicating generation in progress'),
  generativeWidget: generativeWidgetSchema.optional().describe('Attached generative UI widget'),
  feedback: z.enum(['like', 'dislike']).nullable().optional().describe('User feedback rating'),
  modelId: modelIdSchema.optional().describe('Model that produced this answer'),
});
export type ChatMessage = z.infer<typeof chatMessageSchema>;

export const chatSessionSchema = z.object({
  id: z.string().describe('Session key'),
  title: z.string().describe('Session conversation subject'),
  createdAt: z.number().describe('Creation epoch time'),
  updatedAt: z.number().describe('Last updated epoch time'),
  messages: z.array(chatMessageSchema).describe('Ordered thread messages'),
  modelId: modelIdSchema.describe('Selected active model'),
});
export type ChatSession = z.infer<typeof chatSessionSchema>;

export const quickPromptSchema = z.object({
  title: z.string().describe('Short card header'),
  prompt: z.string().describe('Complete question text'),
  icon: z.string().describe('Material icon'),
  category: z.enum(['Orders', 'Returns', 'Analytics', 'Support']).describe('Grouping category'),
});
export type QuickPrompt = z.infer<typeof quickPromptSchema>;
