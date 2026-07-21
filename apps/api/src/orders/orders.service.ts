import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaynowService } from '../payments/paynow.service';
import { CreateOrderDto } from './dto/create-order.dto';

function generateBookingRef(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(10000000 + Math.random() * 90000000);
  return `YT-${year}-${rand}`;
}

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paynow: PaynowService,
  ) {}

  async create(dto: CreateOrderDto) {
    const show = await this.prisma.show.findUnique({
      where: { id: dto.showId },
      include: { ticketTypes: true },
    });
    if (!show) throw new NotFoundException('Show not found');

    let subtotal = 0;
    const itemsData = [];

    for (const item of dto.items) {
      const tt = show.ticketTypes.find((t) => t.id === item.ticketTypeId);
      if (!tt) throw new BadRequestException(`Ticket type ${item.ticketTypeId} not found`);

      const remaining = tt.totalQty - tt.soldQty;
      if (remaining < item.quantity) {
        throw new BadRequestException(
          `Only ${remaining} ${tt.name} tickets remaining`,
        );
      }

      const lineTotal = Number(tt.price) * item.quantity;
      subtotal += lineTotal;

      itemsData.push({
        ticketTypeId: item.ticketTypeId,
        quantity: item.quantity,
        unitPrice: Number(tt.price),
        subtotal: lineTotal,
        ticketTypeName: tt.name,
      });
    }

    const bookingRef = generateBookingRef();

    const customer = await this.prisma.customer.create({
      data: {
        firstName: dto.customer.firstName,
        lastName: dto.customer.lastName,
        email: dto.customer.email,
        phone: dto.customer.phone,
        country: dto.customer.country || 'Zimbabwe',
        company: dto.customer.company,
      },
    });

    const order = await this.prisma.order.create({
      data: {
        bookingRef,
        customerId: customer.id,
        showId: dto.showId,
        subtotal,
        fees: 0,
        total: subtotal,
        currency: 'USD',
        paymentMethod: dto.paymentMethod,
        promoCode: dto.promoCode,
        status: 'PENDING',
        items: {
          create: itemsData.map((i) => ({
            ticketTypeId: i.ticketTypeId,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            subtotal: i.subtotal,
          })),
        },
      },
      include: { items: { include: { ticketType: true } }, customer: true, show: true },
    });

    const paynowResult = await this.paynow.initiate({
      order,
      paymentMethod: dto.paymentMethod,
      ecocashNumber: dto.ecocashNumber,
    });

    await this.prisma.order.update({
      where: { id: order.id },
      data: { paynowRef: paynowResult.paynowRef, pollUrl: paynowResult.pollUrl },
    });

    return {
      bookingRef,
      orderId: order.id,
      total: subtotal,
      currency: 'USD',
      paymentMethod: dto.paymentMethod,
      redirectUrl: paynowResult.redirectUrl,
      pollUrl: paynowResult.pollUrl,
      isMobile: dto.paymentMethod === 'ecocash',
    };
  }

  async lookup(bookingRef: string, email: string) {
    const order = await this.prisma.order.findUnique({
      where: { bookingRef },
      include: {
        customer: true,
        show: true,
        items: { include: { ticketType: true } },
        tickets: true,
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.customer.email.toLowerCase() !== email.toLowerCase()) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async getStatus(bookingRef: string) {
    const order = await this.prisma.order.findUnique({
      where: { bookingRef },
      select: { status: true, bookingRef: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async markPaid(orderId: string, paynowRef: string) {
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'PAID', paynowRef },
      include: {
        customer: true,
        show: true,
        items: { include: { ticketType: true } },
      },
    });
  }
}
