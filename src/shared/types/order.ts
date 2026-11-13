export type OrderStatus =
  | 'new'
  | 'reviewing'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'delivered'
  | 'cancelled';

export type FulfillmentType = 'delivery' | 'pickup';

export interface DeliveryZone {
  id: string;
  name: string;
  fee: number;
  etaMinutes: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  imageUrl: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderCustomer {
  name: string;
  /** Egyptian mobile number in local 11-digit form, e.g. 01012345678. */
  phone: string;
}

export interface OrderAddress {
  zoneId: string;
  zoneName: string;
  street: string;
  /** Building, floor and apartment. */
  details: string;
  landmark: string;
}

export interface OrderStatusChange {
  status: OrderStatus;
  at: string;
  /** Staff member who made the change; null for changes made by the system or the customer. */
  by: string | null;
  note?: string;
}

/** Full order record, visible to restaurant staff only. */
export interface Order {
  id: string;
  code: string;
  status: OrderStatus;
  fulfillment: FulfillmentType;
  customer: OrderCustomer;
  address: OrderAddress | null;
  notes: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  createdAt: string;
  updatedAt: string;
  history: OrderStatusChange[];
}

/** Public view of an order, returned to the customer who placed it. Contact details are masked. */
export interface OrderTracking {
  code: string;
  status: OrderStatus;
  fulfillment: FulfillmentType;
  customerFirstName: string;
  phoneLastDigits: string;
  zoneName: string | null;
  etaMinutes: number;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  createdAt: string;
  history: Pick<OrderStatusChange, 'status' | 'at'>[];
}

export interface CreateOrderRequest {
  fulfillment: FulfillmentType;
  customer: OrderCustomer;
  address: Omit<OrderAddress, 'zoneName'> | null;
  notes: string;
  /** Prices are never sent: the server prices every line from its own catalog. */
  items: { productId: string; quantity: number }[];
}

export interface OrderQuery {
  status?: OrderStatus[];
  fulfillment?: FulfillmentType;
  search?: string;
  /** ISO timestamps bounding `createdAt`. */
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  note?: string;
}
