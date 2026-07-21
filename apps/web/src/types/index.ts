export interface TicketType {
  id: string;
  name: string;
  price: number;
  currency: string;
  totalQty: number;
  soldQty: number;
  color?: string;
  sortOrder: number;
}

export interface Show {
  id: string;
  ysamsId: number;
  title: string;
  slug: string;
  venue: string;
  city: string;
  country: string;
  showDate: string;
  doorsTime?: string;
  description?: string;
  posterUrl?: string;
  mapUrl?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'SOLD_OUT' | 'CANCELLED' | 'COMPLETED';
  capacity: number;
  ticketTypes: TicketType[];
}

export interface OrderItem {
  ticketTypeId: string;
  quantity: number;
}

export interface CustomerFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  company?: string;
}

export interface CreateOrderPayload {
  showId: string;
  items: OrderItem[];
  customer: CustomerFormData;
  paymentMethod: 'paynow_web' | 'ecocash';
  ecocashNumber?: string;
  promoCode?: string;
}

export interface CreateOrderResponse {
  bookingRef: string;
  orderId: string;
  total: number;
  currency: string;
  paymentMethod: string;
  redirectUrl?: string;
  pollUrl?: string;
  isMobile: boolean;
}

export interface OrderLookupResponse {
  id: string;
  bookingRef: string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
  total: number;
  currency: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  show: Show;
  items: Array<{
    quantity: number;
    unitPrice: number;
    subtotal: number;
    ticketType: TicketType;
  }>;
  tickets: Array<{
    ticketCode: string;
    qrImageUrl?: string;
    status: string;
  }>;
}
