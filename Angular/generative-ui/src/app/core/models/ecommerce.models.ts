export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  id?: number;
  orderId?: number;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: string;
  imageUrl?: string | null;
  createdAt?: string | Date;
}

export interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
  totalAmount: string;
  currency: string;
  shippingAddress: string;
  carrier: string;
  trackingNumber?: string;
  estimatedDelivery?: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
  items: OrderItem[];
}

export interface CreateOrderDto {
  orderNumber?: string;
  customerName: string;
  customerEmail: string;
  status?: OrderStatus;
  shippingAddress: string;
  carrier?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  items: {
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: string | number;
    imageUrl?: string;
  }[];
}

export interface UpdateOrderDto {
  customerName?: string;
  customerEmail?: string;
  status?: OrderStatus;
  shippingAddress?: string;
  carrier?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
}

export interface TrackingCheckpoint {
  status: string;
  location: string;
  timestamp: string;
  description: string;
}

export interface TrackingInfo {
  orderNumber: string;
  carrier: string;
  trackingNumber: string;
  status: OrderStatus;
  estimatedDelivery: string;
  checkpoints: TrackingCheckpoint[];
}

export type TicketType = 'return' | 'refund' | 'cancellation' | 'inquiry' | 'shipping_delay';
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface SupportTicket {
  id: number;
  ticketNumber: string;
  orderNumber: string;
  customerEmail: string;
  type: TicketType;
  status: TicketStatus;
  priority: TicketPriority;
  subject: string;
  description: string;
  resolution?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CreateTicketDto {
  orderNumber: string;
  customerEmail: string;
  type: TicketType;
  status?: TicketStatus;
  priority?: TicketPriority;
  subject: string;
  description: string;
}

export interface UpdateTicketDto {
  status?: TicketStatus;
  priority?: TicketPriority;
  resolution?: string;
  subject?: string;
  description?: string;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}
