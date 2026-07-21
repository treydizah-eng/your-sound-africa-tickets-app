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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PaymentsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const orders_service_1 = require("../orders/orders.service");
const tickets_service_1 = require("../tickets/tickets.service");
const notifications_service_1 = require("../notifications/notifications.service");
const ysams_service_1 = require("../ysams/ysams.service");
const paynow_service_1 = require("./paynow.service");
const prisma_service_1 = require("../prisma/prisma.service");
let PaymentsController = PaymentsController_1 = class PaymentsController {
    constructor(ordersService, ticketsService, notifications, ysams, paynow, prisma) {
        this.ordersService = ordersService;
        this.ticketsService = ticketsService;
        this.notifications = notifications;
        this.ysams = ysams;
        this.paynow = paynow;
        this.prisma = prisma;
        this.logger = new common_1.Logger(PaymentsController_1.name);
    }
    async handleWebhook(body) {
        this.logger.log(`PayNow webhook received: ${JSON.stringify(body)}`);
        const { reference, paynowreference, status, hash, pollurl } = body;
        if (!this.paynow.verifyHash(body, hash)) {
            this.logger.warn('PayNow webhook hash verification failed');
            return { received: true };
        }
        const isPaid = ['paid', 'awaiting delivery', 'delivered'].includes((status || '').toLowerCase());
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
        }
        catch (err) {
            this.logger.error('Post-payment processing error', err);
        }
        return { received: true };
    }
    async pollStatus(bookingRef) {
        const order = await this.prisma.order.findUnique({
            where: { bookingRef },
            select: { status: true, pollUrl: true, bookingRef: true },
        });
        if (!order)
            return { status: 'NOT_FOUND' };
        if (order.status === 'PAID')
            return { status: 'PAID' };
        if (order.pollUrl) {
            const result = await this.paynow.poll(order.pollUrl);
            if (result.paid) {
                return { status: 'PAID' };
            }
        }
        return { status: order.status };
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Post)('webhook'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "handleWebhook", null);
__decorate([
    (0, common_1.Get)('poll'),
    __param(0, (0, common_1.Query)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "pollStatus", null);
exports.PaymentsController = PaymentsController = PaymentsController_1 = __decorate([
    (0, common_1.Controller)('payments'),
    __metadata("design:paramtypes", [orders_service_1.OrdersService,
        tickets_service_1.TicketsService,
        notifications_service_1.NotificationsService,
        ysams_service_1.YsamsService,
        paynow_service_1.PaynowService,
        prisma_service_1.PrismaService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map