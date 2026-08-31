import { eq, desc, ilike, or } from 'drizzle-orm';
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

// Resilient in-memory mock store for initial development / offline database fallback
let mockOrders: OrderWithItems[] = [
  {
    id: 1,
    orderNumber: 'ORD-7821',
    customerName: 'Sarah Jenkins',
    customerEmail: 'sarah.j@example.com',
    status: 'shipped',
    totalAmount: '249.98',
    currency: 'USD',
    shippingAddress: '742 Evergreen Terrace, Springfield, OR 97477',
    carrier: 'FedEx Express',
    trackingNumber: 'FDX-982341829',
    estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
    items: [
      {
        id: 101,
        orderId: 1,
        productName: 'Ergonomic Wireless Mechanical Keyboard',
        sku: 'KB-WL-RGB',
        quantity: 1,
        unitPrice: '149.99',
        imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300',
        createdAt: new Date(),
      },
      {
        id: 102,
        orderId: 1,
        productName: 'Precision Gaming Mouse with Qi Charging',
        sku: 'MS-PRO-QI',
        quantity: 1,
        unitPrice: '99.99',
        imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=300',
        createdAt: new Date(),
      },
    ],
  },
  {
    id: 2,
    orderNumber: 'ORD-9104',
    customerName: 'Marcus Vance',
    customerEmail: 'marcus.v@example.com',
    status: 'delivered',
    totalAmount: '129.50',
    currency: 'USD',
    shippingAddress: '1204 Pine Street, Seattle, WA 98101',
    carrier: 'UPS Ground',
    trackingNumber: '1Z9999999999999999',
    estimatedDelivery: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
    items: [
      {
        id: 103,
        orderId: 2,
        productName: 'Active Noise-Cancelling Bluetooth Headphones',
        sku: 'HP-ANC-BLK',
        quantity: 1,
        unitPrice: '129.50',
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
        createdAt: new Date(),
      },
    ],
  },
  {
    id: 3,
    orderNumber: 'ORD-3312',
    customerName: 'Elena Rostova',
    customerEmail: 'elena.r@example.com',
    status: 'processing',
    totalAmount: '599.00',
    currency: 'USD',
    shippingAddress: '450 Bayview Ave, San Francisco, CA 94107',
    carrier: 'DHL Express',
    trackingNumber: 'DHL-554190823',
    estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    updatedAt: new Date(),
    items: [
      {
        id: 104,
        orderId: 3,
        productName: 'Ultra-Wide 34" Curved Productivity Monitor',
        sku: 'MON-34-UW',
        quantity: 1,
        unitPrice: '599.00',
        imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300',
        createdAt: new Date(),
      },
    ],
  },
  {
    id: 4,
    orderNumber: 'ORD-5520',
    customerName: 'David Chen',
    customerEmail: 'david.c@example.com',
    status: 'pending',
    totalAmount: '89.90',
    currency: 'USD',
    shippingAddress: '88 Tech Blvd, Austin, TX 78701',
    carrier: 'USPS Priority',
    trackingNumber: 'USPS-940011189',
    estimatedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updatedAt: new Date(),
    items: [
      {
        id: 105,
        orderId: 4,
        productName: 'USB-C 10-in-1 Aluminum Docking Station',
        sku: 'HUB-USBC-10',
        quantity: 1,
        unitPrice: '89.90',
        imageUrl: 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=300',
        createdAt: new Date(),
      },
    ],
  },
];

export class OrderService {
  async getAllOrders(filters?: { status?: string; search?: string }): Promise<OrderWithItems[]> {
    try {
      const dbOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
      if (dbOrders.length > 0) {
        const allItems = await db.select().from(orderItems);
        const result = dbOrders.map((ord) => ({
          ...ord,
          items: allItems.filter((i) => i.orderId === ord.id),
        }));
        return this.applyFilters(result, filters);
      }
    } catch {
      // Database not connected or error, fall back to in-memory store
    }
    return this.applyFilters(mockOrders, filters);
  }

  async getOrderById(id: number): Promise<OrderWithItems | null> {
    try {
      const dbOrder = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
      if (dbOrder.length > 0) {
        const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
        return { ...dbOrder[0], items };
      }
    } catch {
      // Fall back to memory
    }
    return mockOrders.find((o) => o.id === id) ?? null;
  }

  async getOrderByNumber(orderNumber: string): Promise<OrderWithItems | null> {
    const cleanNumber = orderNumber.trim().toUpperCase();
    try {
      const dbOrder = await db.select().from(orders).where(eq(orders.orderNumber, cleanNumber)).limit(1);
      if (dbOrder.length > 0) {
        const items = await db.select().from(orderItems).where(eq(orderItems.orderId, dbOrder[0].id));
        return { ...dbOrder[0], items };
      }
    } catch {
      // Fall back to memory
    }
    return mockOrders.find((o) => o.orderNumber.toUpperCase() === cleanNumber) ?? null;
  }

  async createOrder(dto: CreateOrderDto): Promise<OrderWithItems> {
    const generatedOrderNumber =
      dto.orderNumber?.toUpperCase() || `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

    const total = dto.items
      .reduce((acc, itm) => acc + Number(itm.unitPrice) * itm.quantity, 0)
      .toFixed(2);

    try {
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
          carrier: dto.carrier || 'FedEx',
          trackingNumber: dto.trackingNumber || `TRK-${Math.floor(100000000 + Math.random() * 900000000)}`,
          estimatedDelivery: dto.estimatedDelivery ? new Date(dto.estimatedDelivery) : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
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
    } catch {
      // Fall back in-memory save
      const nextId = mockOrders.length > 0 ? Math.max(...mockOrders.map((o) => o.id)) + 1 : 1;
      const newOrder: OrderWithItems = {
        id: nextId,
        orderNumber: generatedOrderNumber,
        customerName: dto.customerName,
        customerEmail: dto.customerEmail,
        status: dto.status ?? 'processing',
        totalAmount: total,
        currency: 'USD',
        shippingAddress: dto.shippingAddress,
        carrier: dto.carrier || 'FedEx',
        trackingNumber: dto.trackingNumber || `TRK-${Math.floor(100000000 + Math.random() * 900000000)}`,
        estimatedDelivery: dto.estimatedDelivery ? new Date(dto.estimatedDelivery) : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
        items: dto.items.map((itm, idx) => ({
          id: 1000 + nextId * 10 + idx,
          orderId: nextId,
          productName: itm.productName,
          sku: itm.sku,
          quantity: itm.quantity,
          unitPrice: itm.unitPrice,
          imageUrl: itm.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300',
          createdAt: new Date(),
        })),
      };
      mockOrders.unshift(newOrder);
      return newOrder;
    }
  }

  async updateOrder(id: number, dto: UpdateOrderDto): Promise<OrderWithItems | null> {
    try {
      const updatedRows = await db
        .update(orders)
        .set({
          ...dto,
          estimatedDelivery: dto.estimatedDelivery ? new Date(dto.estimatedDelivery) : undefined,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, id))
        .returning();

      if (updatedRows.length > 0) {
        const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
        return { ...updatedRows[0], items };
      }
    } catch {
      // Memory fallback
    }

    const orderIndex = mockOrders.findIndex((o) => o.id === id);
    if (orderIndex === -1) return null;

    mockOrders[orderIndex] = {
      ...mockOrders[orderIndex],
      ...dto,
      estimatedDelivery: dto.estimatedDelivery ? new Date(dto.estimatedDelivery) : mockOrders[orderIndex].estimatedDelivery,
      updatedAt: new Date(),
    };
    return mockOrders[orderIndex];
  }

  async deleteOrder(id: number): Promise<boolean> {
    try {
      const deletedRows = await db.delete(orders).where(eq(orders.id, id)).returning();
      if (deletedRows.length > 0) return true;
    } catch {
      // Memory fallback
    }

    const initialLength = mockOrders.length;
    mockOrders = mockOrders.filter((o) => o.id !== id);
    return mockOrders.length < initialLength;
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
        location: 'Central Distribution Hub, Chicago, IL',
        timestamp: new Date(new Date(order.createdAt).getTime() + 4 * 3600 * 1000).toLocaleString(),
        description: 'Package sorted and barcode verified.',
      });
    }

    if (order.status === 'shipped' || order.status === 'delivered') {
      checkpoints.push({
        status: 'In Transit',
        location: 'Regional Logistics Center',
        timestamp: new Date(new Date(order.createdAt).getTime() + 18 * 3600 * 1000).toLocaleString(),
        description: `Departed facility via ${carrier}. On schedule.`,
      });
    }

    if (order.status === 'delivered') {
      checkpoints.push({
        status: 'Delivered',
        location: order.shippingAddress.split(',')[1]?.trim() || 'Front Porch / Mailroom',
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

  private applyFilters(list: OrderWithItems[], filters?: { status?: string; search?: string }): OrderWithItems[] {
    let result = [...list];
    if (filters?.status) {
      const s = filters.status.toLowerCase();
      result = result.filter((o) => o.status.toLowerCase() === s);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerEmail.toLowerCase().includes(q) ||
          (o.trackingNumber && o.trackingNumber.toLowerCase().includes(q))
      );
    }
    return result;
  }
}

export const orderService = new OrderService();
