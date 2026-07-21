"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PaynowService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaynowService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const { Paynow } = require('paynow');
let PaynowService = PaynowService_1 = class PaynowService {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(PaynowService_1.name);
        const integrationId = this.config.get('PAYNOW_INTEGRATION_ID');
        const integrationKey = this.config.get('PAYNOW_INTEGRATION_KEY');
        const apiUrl = this.config.get('API_URL') || 'http://localhost:4000';
        const webUrl = this.config.get('WEB_URL') || 'http://localhost:3000';
        this.paynow = new Paynow(integrationId, integrationKey);
        this.paynow.resultUrl = `${apiUrl}/api/payments/webhook`;
        this.paynow.returnUrl = `${webUrl}/checkout/success`;
    }
    async initiate(params) {
        const { order, paymentMethod, ecocashNumber } = params;
        this.paynow.returnUrl = `${this.config.get('WEB_URL') || 'http://localhost:3000'}/checkout/success?ref=${order.bookingRef}`;
        const payment = this.paynow.createPayment(order.bookingRef, order.customer.email);
        for (const item of order.items) {
            payment.add(`${order.show.title} – ${item.ticketType.name} ×${item.quantity}`, Number(item.subtotal));
        }
        try {
            if (paymentMethod === 'ecocash' && ecocashNumber) {
                const phone = ecocashNumber.replace(/^\+?263/, '0').replace(/\D/g, '');
                const response = await this.paynow.sendMobile(payment, phone, 'ecocash');
                if (!response.success) {
                    this.logger.error(`PayNow EcoCash failed: ${response.error}`);
                    throw new common_1.BadGatewayException('EcoCash payment initiation failed');
                }
                return {
                    paynowRef: response.paynowReference || '',
                    pollUrl: response.pollUrl || '',
                    success: true,
                };
            }
            else {
                const response = await this.paynow.send(payment);
                if (!response.success) {
                    this.logger.error(`PayNow web payment failed: ${response.error}`);
                    throw new common_1.BadGatewayException('Payment initiation failed');
                }
                return {
                    paynowRef: response.paynowReference || '',
                    pollUrl: response.pollUrl || '',
                    redirectUrl: response.redirectUrl || '',
                    success: true,
                };
            }
        }
        catch (err) {
            if (err instanceof common_1.BadGatewayException)
                throw err;
            this.logger.error('PayNow error', err);
            throw new common_1.BadGatewayException('Payment gateway error');
        }
    }
    async poll(pollUrl) {
        try {
            const status = await this.paynow.pollTransaction(pollUrl);
            return {
                paid: status.paid(),
                status: status.status,
            };
        }
        catch (err) {
            this.logger.error('PayNow poll error', err);
            return { paid: false, status: 'error' };
        }
    }
    verifyHash(data, hash) {
        try {
            return this.paynow.verifyHash(data, hash);
        }
        catch {
            return false;
        }
    }
};
exports.PaynowService = PaynowService;
exports.PaynowService = PaynowService = PaynowService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PaynowService);
//# sourceMappingURL=paynow.service.js.map