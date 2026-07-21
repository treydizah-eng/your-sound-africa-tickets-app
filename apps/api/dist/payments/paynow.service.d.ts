import { ConfigService } from '@nestjs/config';
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
export declare class PaynowService {
    private readonly config;
    private readonly logger;
    private paynow;
    constructor(config: ConfigService);
    initiate(params: InitiatePaymentParams): Promise<InitiatePaymentResult>;
    poll(pollUrl: string): Promise<{
        paid: boolean;
        status: string;
    }>;
    verifyHash(data: Record<string, string>, hash: string): boolean;
}
