import { PrismaService } from '../prisma/prisma.service';
import { QrService } from '../qr/qr.service';
export declare class TicketsService {
    private readonly prisma;
    private readonly qr;
    private readonly logger;
    constructor(prisma: PrismaService, qr: QrService);
    generateForOrder(order: any): Promise<any[]>;
    verify(ticketCode: string): Promise<{
        valid: boolean;
        reason: string;
        redeemedAt?: undefined;
        ticket?: undefined;
        show?: undefined;
        customer?: undefined;
    } | {
        valid: boolean;
        reason: string;
        redeemedAt: Date;
        ticket?: undefined;
        show?: undefined;
        customer?: undefined;
    } | {
        valid: boolean;
        ticket: {
            order: {
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
            };
        } & {
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
        };
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
        reason?: undefined;
        redeemedAt?: undefined;
    }>;
    redeem(ticketCode: string): Promise<{
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
    }>;
}
