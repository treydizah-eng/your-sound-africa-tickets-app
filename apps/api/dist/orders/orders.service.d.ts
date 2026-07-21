import { PrismaService } from '../prisma/prisma.service';
import { PaynowService } from '../payments/paynow.service';
import { CreateOrderDto } from './dto/create-order.dto';
export declare class OrdersService {
    private readonly prisma;
    private readonly paynow;
    constructor(prisma: PrismaService, paynow: PaynowService);
    create(dto: CreateOrderDto): Promise<{
        bookingRef: string;
        orderId: string;
        total: number;
        currency: string;
        paymentMethod: "paynow_web" | "ecocash";
        redirectUrl: string;
        pollUrl: string;
        isMobile: boolean;
    }>;
    lookup(bookingRef: string, email: string): Promise<{
        show: {
            ysamsId: number | null;
            title: string;
            venue: string;
            city: string;
            showDate: Date;
            doorsTime: string | null;
            description: string | null;
            posterUrl: string | null;
            capacity: number;
            id: string;
            slug: string;
            country: string;
            mapUrl: string | null;
            status: import(".prisma/client").$Enums.ShowStatus;
            createdAt: Date;
            updatedAt: Date;
        };
        customer: {
            id: string;
            country: string;
            createdAt: Date;
            firstName: string;
            lastName: string;
            email: string;
            phone: string;
            company: string | null;
        };
        items: ({
            ticketType: {
                ysamsPoolId: number | null;
                name: string;
                price: import("@prisma/client/runtime/library").Decimal;
                totalQty: number;
                color: string | null;
                sortOrder: number;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                showId: string;
                currency: string;
                soldQty: number;
            };
        } & {
            id: string;
            ticketTypeId: string;
            quantity: number;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            orderId: string;
        })[];
        tickets: {
            id: string;
            status: import(".prisma/client").$Enums.TicketStatus;
            createdAt: Date;
            ticketTypeId: string;
            orderId: string;
            ticketCode: string;
            qrPayload: string;
            qrImageUrl: string | null;
            pdfUrl: string | null;
            redeemedAt: Date | null;
        }[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        showId: string;
        currency: string;
        paymentMethod: string | null;
        paynowRef: string | null;
        pollUrl: string | null;
        promoCode: string | null;
        bookingRef: string;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        fees: import("@prisma/client/runtime/library").Decimal;
        total: import("@prisma/client/runtime/library").Decimal;
        syncedToYsams: boolean;
        emailSentAt: Date | null;
        whatsappSentAt: Date | null;
        customerId: string;
    }>;
    getStatus(bookingRef: string): Promise<{
        status: import(".prisma/client").$Enums.OrderStatus;
        bookingRef: string;
    }>;
    markPaid(orderId: string, paynowRef: string): Promise<{
        show: {
            ysamsId: number | null;
            title: string;
            venue: string;
            city: string;
            showDate: Date;
            doorsTime: string | null;
            description: string | null;
            posterUrl: string | null;
            capacity: number;
            id: string;
            slug: string;
            country: string;
            mapUrl: string | null;
            status: import(".prisma/client").$Enums.ShowStatus;
            createdAt: Date;
            updatedAt: Date;
        };
        customer: {
            id: string;
            country: string;
            createdAt: Date;
            firstName: string;
            lastName: string;
            email: string;
            phone: string;
            company: string | null;
        };
        items: ({
            ticketType: {
                ysamsPoolId: number | null;
                name: string;
                price: import("@prisma/client/runtime/library").Decimal;
                totalQty: number;
                color: string | null;
                sortOrder: number;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                showId: string;
                currency: string;
                soldQty: number;
            };
        } & {
            id: string;
            ticketTypeId: string;
            quantity: number;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            orderId: string;
        })[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        showId: string;
        currency: string;
        paymentMethod: string | null;
        paynowRef: string | null;
        pollUrl: string | null;
        promoCode: string | null;
        bookingRef: string;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        fees: import("@prisma/client/runtime/library").Decimal;
        total: import("@prisma/client/runtime/library").Decimal;
        syncedToYsams: boolean;
        emailSentAt: Date | null;
        whatsappSentAt: Date | null;
        customerId: string;
    }>;
}
