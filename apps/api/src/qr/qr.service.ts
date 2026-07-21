import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as QRCode from 'qrcode';

export interface QrPayload {
  tid: string;
  oid: string;
  sid: string;
  ts: number;
  sig?: string;
}

@Injectable()
export class QrService {
  constructor(private readonly config: ConfigService) {}

  signPayload(ticketId: string, orderId: string, showId: string): string {
    const secret = this.config.get<string>('QR_SECRET') || 'fallback-secret-change-me';
    const data: QrPayload = {
      tid: ticketId,
      oid: orderId,
      sid: showId,
      ts: Date.now(),
    };
    const str = JSON.stringify(data);
    const sig = crypto.createHmac('sha256', secret).update(str).digest('hex');
    return Buffer.from(JSON.stringify({ ...data, sig })).toString('base64url');
  }

  verifyPayload(payload: string): { valid: boolean; data?: QrPayload } {
    try {
      const secret = this.config.get<string>('QR_SECRET') || 'fallback-secret-change-me';
      const decoded: QrPayload = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
      const { sig, ...rest } = decoded;
      const str = JSON.stringify(rest);
      const expected = crypto.createHmac('sha256', secret).update(str).digest('hex');
      return { valid: sig === expected, data: decoded };
    } catch {
      return { valid: false };
    }
  }

  async generateDataUrl(payload: string): Promise<string> {
    return QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'H',
      width: 300,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    });
  }

  async generateBuffer(payload: string): Promise<Buffer> {
    return QRCode.toBuffer(payload, {
      errorCorrectionLevel: 'H',
      width: 400,
      margin: 2,
    });
  }
}
