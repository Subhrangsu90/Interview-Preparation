import { eq, desc, ilike, or, and, inArray } from 'drizzle-orm';
import { db } from '../db/index.js';
import { orders, orderItems, type Order, type OrderItem } from '../db/schema.js';
import type { CreateOrderDto, UpdateOrderDto } from '../schemas/order.schema.js';

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export interface TrackingCheckpoint {
  status: string;
  location: string;
  timestamp: string;
  description: string;
}

export interface TrackingDetails {
  orderNumber: string;
  carrier: string;
  trackingNumber: string;
  status: string;
  estimatedDelivery: string;
  checkpoints: TrackingCheckpoint[];
}

export class OrderService {
  async getAllOrders(filters?: { status?: string; search?: string }): Promise<OrderWithItems[]> {
    const conditions = [];

    if (filters?.status && filters.status !== 'all') {
      conditions.push(eq(orders.status, filters.status.toLowerCase()));
    }

    if (filters?.search && filters.search.trim()) {
      const term = `%${filters.search.trim()}%`;
      conditions.push(
        or(
          ilike(orders.orderNumber, term),
          ilike(orders.customerName, term),
          ilike(orders.customerEmail, term),
          ilike(orders.trackingNumber, term)
        )
      );
    }

    let query = db.select().from(orders).orderBy(desc(orders.createdAt));
    if (conditions.length > 0) {
      query = db
        .select()
        .from(orders)
        .where(and(...conditions))
        .orderBy(desc(orders.createdAt)) as typeof query;
    }

    const orderRows = await query;
    if (orderRows.length === 0) {
      return [];
    }

    const orderIds = orderRows.map((o) => o.id);
    const itemRows = await db
      .select()
      .from(orderItems)
      .where(inArray(orderItems.orderId, orderIds));

    return orderRows.map((ord) => ({
      ...ord,
      items: itemRows.filter((item) => item.orderId === ord.id),
    }));
  }

  async getOrderById(id: number): Promise<OrderWithItems | null> {
    const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    if (result.length === 0) return null;

    const ord = result[0];
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
    return { ...ord, items };
  }

  async getOrderByNumber(orderNumber: string): Promise<OrderWithItems | null> {
    const cleanNumber = orderNumber.trim().toUpperCase();
    const result = await db
      .select()
      .from(orders)
      .where(eq(orders.orderNumber, cleanNumber))
      .limit(1);

    if (result.length === 0) return null;

    const ord = result[0];
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, ord.id));
    return { ...ord, items };
  }

  async createOrder(dto: CreateOrderDto): Promise<OrderWithItems> {
    const generatedOrderNumber =
      dto.orderNumber?.toUpperCase() || `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

    const total = dto.items
      .reduce((acc, itm) => acc + Number(itm.unitPrice) * itm.quantity, 0)
      .toFixed(2);

    const newOrderRows = await db
      .insert(orders)
      .values({
        orderNumber: generatedOrderNumber,
        customerName: dto.customerName,
        customerEmail: dto.customerEmail,
        status: dto.status ?? 'processing',
        totalAmount: total,
        currency: 'USD',
        shippingAddress: dto.shippingAddress,
        carrier: dto.carrier || 'FedEx Express',
        trackingNumber:
          dto.trackingNumber || `TRK-${Math.floor(100000000 + Math.random() * 900000000)}`,
        estimatedDelivery: dto.estimatedDelivery
          ? new Date(dto.estimatedDelivery)
          : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      })
      .returning();

    const createdOrder = newOrderRows[0];

    const insertedItems: OrderItem[] = [];
    for (const item of dto.items) {
      const itemRows = await db
        .insert(orderItems)
        .values({
          orderId: createdOrder.id,
          productName: item.productName,
          sku: item.sku,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          imageUrl: item.imageUrl || null,
        })
        .returning();
      insertedItems.push(itemRows[0]);
    }

    return { ...createdOrder, items: insertedItems };
  }

  async updateOrder(id: number, dto: UpdateOrderDto): Promise<OrderWithItems | null> {
    const updatePayload: Record<string, unknown> = {
      ...dto,
      updatedAt: new Date(),
    };

    if (dto.estimatedDelivery) {
      updatePayload['estimatedDelivery'] = new Date(dto.estimatedDelivery);
    }

    const updatedRows = await db
      .update(orders)
      .set(updatePayload)
      .where(eq(orders.id, id))
      .returning();

    if (updatedRows.length === 0) return null;

    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
    return { ...updatedRows[0], items };
  }

  async deleteOrder(id: number): Promise<boolean> {
    const deletedRows = await db.delete(orders).where(eq(orders.id, id)).returning();
    return deletedRows.length > 0;
  }

  async getTracking(orderNumber: string): Promise<TrackingDetails | null> {
    const order = await this.getOrderByNumber(orderNumber);
    if (!order) return null;

    const carrier = order.carrier || 'FedEx Express';
    const trackingNumber = order.trackingNumber || 'FDX-7719203';
    const estDelivery = order.estimatedDelivery
      ? new Date(order.estimatedDelivery).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        })
      : 'In 2-3 business days';

    const checkpoints: TrackingCheckpoint[] = [
      {
        status: 'Order Placed',
        location: 'Merchant Fulfillment Center',
        timestamp: new Date(order.createdAt).toLocaleString(),
        description: 'Order confirmed and electronic shipping info received.',
      },
    ];

    if (order.status !== 'pending' && order.status !== 'cancelled') {
      checkpoints.push({
        status: 'Picked & Packed',
        location: 'Central Distribution Hub',
        timestamp: new Date(new Date(order.createdAt).getTime() + 4 * 3600 * 1000).toLocaleString(),
        description: 'Package sorted and barcode verified.',
      });
    }

    if (order.status === 'shipped' || order.status === 'delivered') {
      checkpoints.push({
        status: 'In Transit',
        location: 'Regional Logistics Hub',
        timestamp: new Date(new Date(order.createdAt).getTime() + 18 * 3600 * 1000).toLocaleString(),
        description: `Departed facility via ${carrier}. On schedule.`,
      });
    }

    if (order.status === 'delivered') {
      checkpoints.push({
        status: 'Delivered',
        location: order.shippingAddress.split(',')[1]?.trim() || 'Front Door / Mailbox',
        timestamp: new Date(order.updatedAt).toLocaleString(),
        description: 'Delivered, signed by resident.',
      });
    }

    return {
      orderNumber: order.orderNumber,
      carrier,
      trackingNumber,
      status: order.status,
      estimatedDelivery: estDelivery,
      checkpoints,
    };
  }
}

export const orderService = new OrderService();
