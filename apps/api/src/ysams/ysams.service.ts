import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class YsamsService {
  private readonly logger = new Logger(YsamsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async recordSale(order: any) {
    const payload = {
      bookingRef: order.bookingRef,
      showYsamsId: order.show.ysamsId,
      customerName: `${order.customer.firstName} ${order.customer.lastName}`,
      customerEmail: order.customer.email,
      customerPhone: order.customer.phone,
      total: Number(order.total),
      currency: order.currency,
      paymentMethod: order.paymentMethod,
      paynowRef: order.paynowRef,
      items: order.items.map((i: any) => ({
        ticketTypeName: i.ticketType.name,
        ysamsPoolId: i.ticketType.ysamsPoolId,
        quantity: i.quantity,
        unitPrice: Number(i.unitPrice),
        subtotal: Number(i.subtotal),
      })),
      soldAt: new Date().toISOString(),
    };

    await this.prisma.syncEvent.create({
      data: {
        eventType: 'SALE',
        orderId: order.id,
        payload,
        synced: false,
      },
    });

    await this.pushToYsams(order.id, payload);
  }

  private async pushToYsams(orderId: string, payload: any) {
    const ysamsUrl = this.config.get('YSAMS_API_URL');
    const apiKey = this.config.get('YSAMS_API_KEY');

    if (!ysamsUrl || !apiKey) {
      this.logger.warn('YSAMS_API_URL or YSAMS_API_KEY not configured — sync skipped');
      return;
    }

    try {
      const response = await fetch(`${ysamsUrl}/record-sale.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000),
      });

      if (response.ok) {
        await this.prisma.syncEvent.updateMany({
          where: { orderId, synced: false },
          data: { synced: true, syncedAt: new Date() },
        });
        this.logger.log(`YSAMS sync successful for order ${payload.bookingRef}`);
      } else {
        const text = await response.text();
        this.logger.warn(`YSAMS sync HTTP ${response.status}: ${text}`);
      }
    } catch (err) {
      this.logger.error(`YSAMS sync failed for order ${payload.bookingRef}`, err);
      await this.prisma.syncEvent.updateMany({
        where: { orderId, synced: false },
        data: { retries: { increment: 1 }, error: String(err) },
      });
    }
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async retryFailedSyncs() {
    const pending = await this.prisma.syncEvent.findMany({
      where: { synced: false, retries: { lt: 5 } },
      take: 20,
    });

    if (pending.length === 0) return;

    this.logger.log(`Retrying ${pending.length} failed YSAMS sync events`);

    for (const event of pending) {
      await this.pushToYsams(event.orderId || '', event.payload as any);
    }
  }
}
