import { z } from 'zod';

export const createItemSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: 'Title cannot be empty' })
    .max(255, { message: 'Title cannot exceed 255 characters' }),
  description: z.string().trim().optional(),
  status: z.enum(['active', 'archived', 'pending']).default('active'),
});

export const updateItemSchema = createItemSchema.partial();

export const itemIdParamSchema = z.object({
  id: z.coerce.number().int().positive({ message: 'ID must be a positive integer' }),
});

export type CreateItemDto = z.infer<typeof createItemSchema>;
export type UpdateItemDto = z.infer<typeof updateItemSchema>;
export type ItemIdParam = z.infer<typeof itemIdParamSchema>;
