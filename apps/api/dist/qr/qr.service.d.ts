import { ConfigService } from '@nestjs/config';
export interface QrPayload {
    tid: string;
    oid: string;
    sid: string;
    ts: number;
    sig?: string;
}
export declare class QrService {
    private readonly config;
    constructor(config: ConfigService);
    signPayload(ticketId: string, orderId: string, showId: string): string;
    verifyPayload(payload: string): {
        valid: boolean;
        data?: QrPayload;
    };
    generateDataUrl(payload: string): Promise<string>;
    generateBuffer(payload: string): Promise<Buffer>;
}
