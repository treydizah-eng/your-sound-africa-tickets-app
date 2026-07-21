import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
export declare class NotificationsService {
    private readonly config;
    private readonly prisma;
    private readonly logger;
    private resend;
    private twilioClient;
    constructor(config: ConfigService, prisma: PrismaService);
    sendTicketDelivery(order: any, tickets: any[]): Promise<void>;
    private sendEmail;
    private sendWhatsApp;
    private buildTicketEmailHtml;
    private updateEmailSent;
    private updateWhatsAppSent;
}
