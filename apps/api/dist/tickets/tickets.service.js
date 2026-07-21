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
var TicketsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const qr_service_1 = require("../qr/qr.service");
let TicketsService = TicketsService_1 = class TicketsService {
    constructor(prisma, qr) {
        this.prisma = prisma;
        this.qr = qr;
        this.logger = new common_1.Logger(TicketsService_1.name);
    }
    async generateForOrder(order) {
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
    async verify(ticketCode) {
        const ticket = await this.prisma.ticket.findUnique({
            where: { ticketCode },
            include: { order: { include: { show: true, customer: true } } },
        });
        if (!ticket)
            return { valid: false, reason: 'NOT_FOUND' };
        if (ticket.status === 'REDEEMED') {
            return { valid: false, reason: 'ALREADY_REDEEMED', redeemedAt: ticket.redeemedAt };
        }
        if (ticket.status === 'CANCELLED')
            return { valid: false, reason: 'CANCELLED' };
        if (ticket.order.status !== 'PAID')
            return { valid: false, reason: 'UNPAID' };
        return {
            valid: true,
            ticket,
            show: ticket.order.show,
            customer: ticket.order.customer,
        };
    }
    async redeem(ticketCode) {
        return this.prisma.ticket.update({
            where: { ticketCode },
            data: { status: 'REDEEMED', redeemedAt: new Date() },
        });
    }
};
exports.TicketsService = TicketsService;
exports.TicketsService = TicketsService = TicketsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        qr_service_1.QrService])
], TicketsService);
//# sourceMappingURL=tickets.service.js.map