import { Environment, validateEnvironment } from './environment.model';

export const environment: Environment = validateEnvironment({
  production: true,
  apiBaseUrl: '/api',
  endpoints: {
    health: 'health',
    orders: {
      base: 'orders',
      byId: (id: string | number) => `orders/${id}`,
      byNumber: (orderNumber: string) => `orders/number/${orderNumber}`,
      tracking: (orderNumber: string) => `orders/tracking/${orderNumber}`,
    },
    supportTickets: {
      base: 'support-tickets',
      byId: (id: string | number) => `support-tickets/${id}`,
    },
  },
});
