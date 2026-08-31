import { eq, desc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { items, type Item } from '../db/schema.js';
import type { CreateItemDto, UpdateItemDto } from '../schemas/item.schema.js';

export class ItemService {
  async getAllItems(): Promise<Item[]> {
    return await db.select().from(items).orderBy(desc(items.createdAt));
  }

  async getItemById(id: number): Promise<Item | null> {
    const result = await db.select().from(items).where(eq(items.id, id)).limit(1);
    return result[0] ?? null;
  }

  async createItem(dto: CreateItemDto): Promise<Item> {
    const result = await db
      .insert(items)
      .values({
        title: dto.title,
        description: dto.description,
        status: dto.status,
      })
      .returning();
    return result[0];
  }

  async updateItem(id: number, dto: UpdateItemDto): Promise<Item | null> {
    const result = await db
      .update(items)
      .set({
        ...dto,
        updatedAt: new Date(),
      })
      .where(eq(items.id, id))
      .returning();
    return result[0] ?? null;
  }

  async deleteItem(id: number): Promise<boolean> {
    const result = await db.delete(items).where(eq(items.id, id)).returning();
    return result.length > 0;
  }
}

export const itemService = new ItemService();
