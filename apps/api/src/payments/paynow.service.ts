import { Injectable, Logger, BadGatewayException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Paynow } = require('paynow');

export interface InitiatePaymentParams {
  order: any;
  paymentMethod: 'paynow_web' | 'ecocash';
  ecocashNumber?: string;
}

export interface InitiatePaymentResult {
  paynowRef: string;
  pollUrl: string;
  redirectUrl?: string;
  success: boolean;
}

@Injectable()
export class PaynowService {
  private readonly logger = new Logger(PaynowService.name);
  private paynow: any;

  constructor(private readonly config: ConfigService) {
    const integrationId = this.config.get('PAYNOW_INTEGRATION_ID');
    const integrationKey = this.config.get('PAYNOW_INTEGRATION_KEY');
    const apiUrl = this.config.get('API_URL') || 'http://localhost:4000';
    const webUrl = this.config.get('WEB_URL') || 'http://localhost:3000';

    this.paynow = new Paynow(integrationId, integrationKey);
    this.paynow.resultUrl = `${apiUrl}/api/payments/webhook`;
    this.paynow.returnUrl = `${webUrl}/checkout/success`;
  }

  async initiate(params: InitiatePaymentParams): Promise<InitiatePaymentResult> {
    const { order, paymentMethod, ecocashNumber } = params;

    this.paynow.returnUrl = `${this.config.get('WEB_URL') || 'http://localhost:3000'}/checkout/success?ref=${order.bookingRef}`;

    const payment = this.paynow.createPayment(order.bookingRef, order.customer.email);

    for (const item of order.items) {
      payment.add(
        `${order.show.title} – ${item.ticketType.name} ×${item.quantity}`,
        Number(item.subtotal),
      );
    }

    try {
      if (paymentMethod === 'ecocash' && ecocashNumber) {
        const phone = ecocashNumber.replace(/^\+?263/, '0').replace(/\D/g, '');
        const response = await this.paynow.sendMobile(payment, phone, 'ecocash');

        if (!response.success) {
          this.logger.error(`PayNow EcoCash failed: ${response.error}`);
          throw new BadGatewayException('EcoCash payment initiation failed');
        }

        return {
          paynowRef: response.paynowReference || '',
          pollUrl: response.pollUrl || '',
          success: true,
        };
      } else {
        const response = await this.paynow.send(payment);

        if (!response.success) {
          this.logger.error(`PayNow web payment failed: ${response.error}`);
          throw new BadGatewayException('Payment initiation failed');
        }

        return {
          paynowRef: response.paynowReference || '',
          pollUrl: response.pollUrl || '',
          redirectUrl: response.redirectUrl || '',
          success: true,
        };
      }
    } catch (err) {
      if (err instanceof BadGatewayException) throw err;
      this.logger.error('PayNow error', err);
      throw new BadGatewayException('Payment gateway error');
    }
  }

  async poll(pollUrl: string): Promise<{ paid: boolean; status: string }> {
    try {
      const status = await this.paynow.pollTransaction(pollUrl);
      return {
        paid: status.paid(),
        status: status.status,
      };
    } catch (err) {
      this.logger.error('PayNow poll error', err);
      return { paid: false, status: 'error' };
    }
  }

  verifyHash(data: Record<string, string>, hash: string): boolean {
    try {
      return this.paynow.verifyHash(data, hash);
    } catch {
      return false;
    }
  }
}
