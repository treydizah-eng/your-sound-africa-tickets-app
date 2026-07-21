export declare class OrderItemDto {
    ticketTypeId: string;
    quantity: number;
}
export declare class CustomerDto {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country?: string;
    company?: string;
}
export declare class CreateOrderDto {
    showId: string;
    items: OrderItemDto[];
    customer: CustomerDto;
    paymentMethod: 'paynow_web' | 'ecocash';
    ecocashNumber?: string;
    promoCode?: string;
}
