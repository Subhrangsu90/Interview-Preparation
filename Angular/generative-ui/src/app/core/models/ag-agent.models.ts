import { z } from 'zod';
import { Tool } from '@ag-ui/client';

export const orderCardPayloadSchema = z.object({
    orderNumber: z.string().describe('The order reference code'),
    status: z.enum(['pending', 'processing', 'in_transit', 'delivered']).describe('Current delivery status'),
    eta: z.string().describe('Estimated arrival time')
});

export type OrderCardPayload = z.infer<typeof orderCardPayloadSchema>;

export const renderOrderCardTool: Tool = {
    name: 'renderOrderCard',
    description: 'Renders an interactive order tracker card widget on the client screen.',
    parameters: z.toJSONSchema(orderCardPayloadSchema),
}