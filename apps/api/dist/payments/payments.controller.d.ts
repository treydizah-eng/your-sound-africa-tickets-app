import { OrdersService } from '../orders/orders.service';
import { TicketsService } from '../tickets/tickets.service';
import { NotificationsService } from '../notifications/notifications.service';
import { YsamsService } from '../ysams/ysams.service';
import { PaynowService } from './paynow.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class PaymentsController {
    private readonly ordersService;
    private readonly ticketsService;
    private readonly notifications;
    private readonly ysams;
    private readonly paynow;
    private readonly prisma;
    private readonly logger;
    constructor(ordersService: OrdersService, ticketsService: TicketsService, notifications: NotificationsService, ysams: YsamsService, paynow: PaynowService, prisma: PrismaService);
    handleWebhook(body: Record<string, string>): Promise<{
        received: boolean;
    }>;
    pollStatus(bookingRef: string): Promise<{
        status: string;
    }>;
}
