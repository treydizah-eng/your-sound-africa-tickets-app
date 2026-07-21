import { Controller, Post, Body, Logger, HttpCode, Get, Query } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';
import { TicketsService } from '../tickets/tickets.service';
import { NotificationsService } from '../notifications/notifications.service';
import { YsamsService } from '../ysams/ysams.service';
import { PaynowService } from './paynow.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(
    private readonly ordersService: OrdersService,
    private readonly ticketsService: TicketsService,
    private readonly notifications: NotificationsService,
    private readonly ysams: YsamsService,
    private readonly paynow: PaynowService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(@Body() body: Record<string, string>) {
    this.logger.log(`PayNow webhook received: ${JSON.stringify(body)}`);

    const { reference, paynowreference, status, hash, pollurl } = body;

    if (!this.paynow.verifyHash(body, hash)) {
      this.logger.warn('PayNow webhook hash verification failed');
      return { received: true };
    }

    const isPaid = ['paid', 'awaiting delivery', 'delivered'].includes(
      (status || '').toLowerCase(),
    );

    if (!isPaid) {
      this.logger.log(`PayNow payment not yet paid — status: ${status}`);
      return { received: true };
    }

    const order = await this.prisma.order.findUnique({
      where: { bookingRef: reference },
      include: { customer: true, show: true, items: { include: { ticketType: true } } },
    });

    if (!order) {
      this.logger.warn(`Order not found for ref: ${reference}`);
      return { received: true };
    }

    if (order.status === 'PAID') {
      this.logger.log(`Order ${reference} already processed`);
      return { received: true };
    }

    const paidOrder = await this.ordersService.markPaid(order.id, paynowreference);

    try {
      const tickets = await this.ticketsService.generateForOrder(paidOrder);
      await this.notifications.sendTicketDelivery(paidOrder, tickets);
      await this.ysams.recordSale(paidOrder);
    } catch (err) {
      this.logger.error('Post-payment processing error', err);
    }

    return { received: true };
  }

  @Get('poll')
  async pollStatus(@Query('ref') bookingRef: string) {
    const order = await this.prisma.order.findUnique({
      where: { bookingRef },
      select: { status: true, pollUrl: true, bookingRef: true },
    });
    if (!order) return { status: 'NOT_FOUND' };
    if (order.status === 'PAID') return { status: 'PAID' };

    if (order.pollUrl) {
      const result = await this.paynow.poll(order.pollUrl);
      if (result.paid) {
        return { status: 'PAID' };
      }
    }

    return { status: order.status };
  }
}
