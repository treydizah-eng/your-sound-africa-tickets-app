import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QrService } from '../qr/qr.service';

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly qr: QrService,
  ) {}

  async generateForOrder(order: any) {
    const tickets = [];
    let ticketIndex = 1;

    for (const item of order.items) {
      for (let i = 0; i < item.quantity; i++) {
        const ticketCode = `${order.bookingRef}-${String(ticketIndex).padStart(3, '0')}`;

        const qrPayload = this.qr.signPayload(ticketCode, order.id, order.showId);
        const qrDataUrl = await this.qr.generateDataUrl(qrPayload);

        const ticket = await this.prisma.ticket.create({
          data: {
            ticketCode,
            orderId: order.id,
            ticketTypeId: item.ticketTypeId,
            qrPayload,
            qrImageUrl: qrDataUrl,
            status: 'VALID',
          },
        });

        await this.prisma.ticketType.update({
          where: { id: item.ticketTypeId },
          data: { soldQty: { increment: 1 } },
        });

        tickets.push({
          ...ticket,
          ticketTypeName: item.ticketType.name,
          showTitle: order.show.title,
          showDate: order.show.showDate,
          venue: order.show.venue,
          city: order.show.city,
          customerName: `${order.customer.firstName} ${order.customer.lastName}`,
        });

        ticketIndex++;
      }
    }

    this.logger.log(`Generated ${tickets.length} tickets for order ${order.bookingRef}`);
    return tickets;
  }

  async verify(ticketCode: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { ticketCode },
      include: { order: { include: { show: true, customer: true } } },
    });

    if (!ticket) return { valid: false, reason: 'NOT_FOUND' };
    if (ticket.status === 'REDEEMED') {
      return { valid: false, reason: 'ALREADY_REDEEMED', redeemedAt: ticket.redeemedAt };
    }
    if (ticket.status === 'CANCELLED') return { valid: false, reason: 'CANCELLED' };
    if (ticket.order.status !== 'PAID') return { valid: false, reason: 'UNPAID' };

    return {
      valid: true,
      ticket,
      show: ticket.order.show,
      customer: ticket.order.customer,
    };
  }

  async redeem(ticketCode: string) {
    return this.prisma.ticket.update({
      where: { ticketCode },
      data: { status: 'REDEEMED', redeemedAt: new Date() },
    });
  }
}
