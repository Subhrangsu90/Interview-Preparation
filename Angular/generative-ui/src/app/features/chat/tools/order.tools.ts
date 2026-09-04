import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { z } from 'zod';
import { createFrontendTool } from '@core/util-copilotkit/tool-definition';
import { OrderCardWidgetComponent, OrderWidgetArgs } from './order-card-widget.component';

// 1. Generative Widget Tool
export const orderCardWidgetTool = createFrontendTool<OrderWidgetArgs>({
  name: 'renderOrderCard',
  description: 'Displays a live interactive order status card widget in the chat conversation.',
  parameters: z.object({
    orderNumber: z.string().describe('The order identifier e.g. ORD-3593'),
    status: z.enum(['pending', 'processing', 'in_transit', 'delivered']).describe('Current delivery status'),
    eta: z.string().describe('Estimated arrival date and time'),
  }),
  component: OrderCardWidgetComponent, // <--- Binds to the Angular component!
  followUp: false, // Tells the agent this completes the response (no extra roundtrip)
  handler: async () => ({ rendered: true }),
});

// 2. Client Action Tool (e.g. Navigation)
export const navigateToOrdersTool = createFrontendTool({
  name: 'navigateToOrders',
  description: 'Navigates the user to the orders management dashboard.',
  parameters: z.object({}),
  handler: async () => {
    const router = inject(Router);
    await router.navigate(['/orders']);
    return { success: true };
  },
});
