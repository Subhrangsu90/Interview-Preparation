import { z } from 'zod';

export const apiEndpointsSchema = z.object({
  health: z.string().min(1, 'Health endpoint is required'),
  orders: z.object({
    base: z.string().min(1, 'Orders base endpoint is required'),
    byId: z.custom<(id: string | number) => string>(
      (val) => typeof val === 'function',
      'byId must be a function'
    ),
    byNumber: z.custom<(orderNumber: string) => string>(
      (val) => typeof val === 'function',
      'byNumber must be a function'
    ),
    tracking: z.custom<(orderNumber: string) => string>(
      (val) => typeof val === 'function',
      'tracking must be a function'
    ),
  }),
  supportTickets: z.object({
    base: z.string().min(1, 'Support tickets base endpoint is required'),
    byId: z.custom<(id: string | number) => string>(
      (val) => typeof val === 'function',
      'byId must be a function'
    ),
  }),
});

export const environmentSchema = z.object({
  production: z.boolean(),
  apiBaseUrl: z.string().min(1, 'API base URL is required'),
  endpoints: apiEndpointsSchema,
});

export type ApiEndpoints = z.infer<typeof apiEndpointsSchema>;
export type Environment = z.infer<typeof environmentSchema>;

/**
 * Validates the environment configuration against environmentSchema.
 * Throws a ZodError if validation fails.
 */
export function validateEnvironment(config: unknown): Environment {
  return environmentSchema.parse(config);
}
