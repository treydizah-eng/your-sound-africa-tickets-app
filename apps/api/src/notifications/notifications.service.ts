import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import twilio from 'twilio';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private resend: Resend;
  private twilioClient: any;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.resend = new Resend(this.config.get('RESEND_API_KEY'));

    const sid = this.config.get('TWILIO_ACCOUNT_SID');
    const token = this.config.get('TWILIO_AUTH_TOKEN');
    if (sid && token && sid.startsWith('AC')) {
      this.twilioClient = twilio(sid, token);
    }
  }

  async sendTicketDelivery(order: any, tickets: any[]) {
    await Promise.allSettled([
      this.sendEmail(order, tickets),
      this.sendWhatsApp(order, tickets),
    ]);
  }

  private async sendEmail(order: any, tickets: any[]) {
    try {
      const html = this.buildTicketEmailHtml(order, tickets);
      await this.resend.emails.send({
        from: this.config.get('EMAIL_FROM') || 'tickets@yoticketsafrica.com',
        to: order.customer.email,
        subject: `🎫 Your tickets for ${order.show.title} — Booking ${order.bookingRef}`,
        html,
      });
      await this.updateEmailSent(order.id);
      this.logger.log(`Email sent to ${order.customer.email} for ${order.bookingRef}`);
    } catch (err) {
      this.logger.error(`Email failed for ${order.bookingRef}`, err);
    }
  }

  private async sendWhatsApp(order: any, tickets: any[]) {
    if (!this.twilioClient) {
      this.logger.warn('Twilio not configured — skipping WhatsApp');
      return;
    }

    try {
      const from = this.config.get('TWILIO_WHATSAPP_FROM') || 'whatsapp:+14155238886';
      const phone = order.customer.phone.replace(/^\+?/, '+').replace(/[^+\d]/g, '');
      const to = `whatsapp:${phone.startsWith('+') ? phone : '+' + phone}`;

      const ticketLines = tickets
        .map(
          (t, i) =>
            `*Ticket ${i + 1}:* ${t.ticketTypeName}\n📋 Code: \`${t.ticketCode}\``,
        )
        .join('\n\n');

      const showDate = new Date(order.show.showDate).toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      const message = [
        `🎫 *YoTicketsAfrica*`,
        ``,
        `Hi ${order.customer.firstName}! Your tickets are confirmed.`,
        ``,
        `*${order.show.title}*`,
        `📅 ${showDate}`,
        `📍 ${order.show.venue}, ${order.show.city}`,
        ``,
        ticketLines,
        ``,
        `*Booking Ref:* ${order.bookingRef}`,
        ``,
        `Please show the QR code at the gate. Save this message!`,
        ``,
        `Questions? Reply to this message or email tickets@yoticketsafrica.com`,
      ].join('\n');

      await this.twilioClient.messages.create({ from, to, body: message });

      if (tickets[0]?.qrImageUrl?.startsWith('data:image')) {
        this.logger.log('QR is a data URL — skipping media send (attach PDF link instead)');
      }

      await this.updateWhatsAppSent(order.id);
      this.logger.log(`WhatsApp sent to ${to} for ${order.bookingRef}`);
    } catch (err) {
      this.logger.error(`WhatsApp failed for ${order.bookingRef}`, err);
    }
  }

  private buildTicketEmailHtml(order: any, tickets: any[]): string {
    const showDate = new Date(order.show.showDate).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const ticketRows = tickets
      .map(
        (t) => `
      <div style="background:#1a1a2e;border:1px solid #f7a800;border-radius:12px;padding:24px;margin-bottom:16px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
          <div>
            <p style="color:#f7a800;font-size:12px;margin:0;text-transform:uppercase;letter-spacing:1px;">Ticket</p>
            <p style="color:#fff;font-size:20px;font-weight:700;margin:4px 0;">${t.ticketTypeName}</p>
            <p style="color:#9ca3af;font-size:13px;margin:0;">Code: <strong style="color:#fff;">${t.ticketCode}</strong></p>
          </div>
        </div>
        ${
          t.qrImageUrl && t.qrImageUrl.startsWith('data:image')
            ? `<div style="text-align:center;margin-top:16px;">
                <img src="${t.qrImageUrl}" alt="QR Code" style="width:180px;height:180px;border-radius:8px;" />
                <p style="color:#9ca3af;font-size:11px;margin-top:8px;">Show this QR at the gate</p>
               </div>`
            : ''
        }
      </div>`,
      )
      .join('');

    return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
    <body style="margin:0;padding:0;background:#080810;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
      <div style="max-width:600px;margin:0 auto;padding:32px 16px;">

        <div style="text-align:center;margin-bottom:32px;">
          <h1 style="color:#f7a800;font-size:28px;margin:0;font-weight:800;letter-spacing:-1px;">
            YoTickets<span style="color:#fff;">Africa</span>
          </h1>
          <p style="color:#9ca3af;margin:4px 0 0;">Your booking is confirmed ✓</p>
        </div>

        <div style="background:#12121f;border-radius:16px;padding:24px;margin-bottom:24px;">
          <h2 style="color:#fff;margin:0 0 8px;font-size:22px;">${order.show.title}</h2>
          <p style="color:#f7a800;margin:0 0 4px;">📅 ${showDate}</p>
          <p style="color:#9ca3af;margin:0 0 4px;">📍 ${order.show.venue}, ${order.show.city}</p>
          <div style="margin-top:16px;padding-top:16px;border-top:1px solid #1e1e30;">
            <p style="color:#9ca3af;font-size:12px;margin:0;">BOOKING REFERENCE</p>
            <p style="color:#f7a800;font-size:24px;font-weight:700;margin:4px 0;letter-spacing:2px;">${order.bookingRef}</p>
          </div>
        </div>

        ${ticketRows}

        <div style="background:#12121f;border-radius:12px;padding:20px;margin-top:24px;">
          <p style="color:#fff;font-weight:700;margin:0 0 8px;">Order Summary</p>
          <p style="color:#9ca3af;margin:0 0 4px;">Name: <span style="color:#fff;">${order.customer.firstName} ${order.customer.lastName}</span></p>
          <p style="color:#9ca3af;margin:0 0 4px;">Email: <span style="color:#fff;">${order.customer.email}</span></p>
          <p style="color:#9ca3af;margin:0;font-weight:700;">Total Paid: <span style="color:#f7a800;">$${Number(order.total).toFixed(2)}</span></p>
        </div>

        <div style="text-align:center;margin-top:32px;">
          <p style="color:#6b7280;font-size:12px;">
            YoTicketsAfrica · tickets@yoticketsafrica.com<br>
            This email was sent to ${order.customer.email}
          </p>
        </div>

      </div>
    </body>
    </html>`;
  }

  private async updateEmailSent(orderId: string) {
    try {
      await this.prisma.order.update({
        where: { id: orderId },
        data: { emailSentAt: new Date() },
      });
    } catch (err) {
      this.logger.warn(`Could not update emailSentAt for order ${orderId}`, err);
    }
  }

  private async updateWhatsAppSent(orderId: string) {
    try {
      await this.prisma.order.update({
        where: { id: orderId },
        data: { whatsappSentAt: new Date() },
      });
    } catch (err) {
      this.logger.warn(`Could not update whatsappSentAt for order ${orderId}`, err);
    }
  }
}
