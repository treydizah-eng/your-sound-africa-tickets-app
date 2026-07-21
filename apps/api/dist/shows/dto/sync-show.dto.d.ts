export declare class SyncTicketTypeDto {
    ysamsPoolId: number;
    name: string;
    price: number;
    totalQty: number;
    color?: string;
    sortOrder?: number;
}
export declare class SyncShowDto {
    ysamsId: number;
    title: string;
    venue: string;
    city: string;
    showDate: string;
    doorsTime?: string;
    description?: string;
    posterUrl?: string;
    capacity?: number;
    ticketTypes: SyncTicketTypeDto[];
}
