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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const paynow_service_1 = require("../payments/paynow.service");
function generateBookingRef() {
    const year = new Date().getFullYear();
    const rand = Math.floor(10000000 + Math.random() * 90000000);
    return `YT-${year}-${rand}`;
}
let OrdersService = class OrdersService {
    constructor(prisma, paynow) {
        this.prisma = prisma;
        this.paynow = paynow;
    }
    async create(dto) {
        const show = await this.prisma.show.findUnique({
            where: { id: dto.showId },
            include: { ticketTypes: true },
        });
        if (!show)
            throw new common_1.NotFoundException('Show not found');
        let subtotal = 0;
        const itemsData = [];
        for (const item of dto.items) {
            const tt = show.ticketTypes.find((t) => t.id === item.ticketTypeId);
            if (!tt)
                throw new common_1.BadRequestException(`Ticket type ${item.ticketTypeId} not found`);
            const remaining = tt.totalQty - tt.soldQty;
            if (remaining < item.quantity) {
                throw new common_1.BadRequestException(`Only ${remaining} ${tt.name} tickets remaining`);
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
    async lookup(bookingRef, email) {
        const order = await this.prisma.order.findUnique({
            where: { bookingRef },
            include: {
                customer: true,
                show: true,
                items: { include: { ticketType: true } },
                tickets: true,
            },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        if (order.customer.email.toLowerCase() !== email.toLowerCase()) {
            throw new common_1.NotFoundException('Order not found');
        }
        return order;
    }
    async getStatus(bookingRef) {
        const order = await this.prisma.order.findUnique({
            where: { bookingRef },
            select: { status: true, bookingRef: true },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        return order;
    }
    async markPaid(orderId, paynowRef) {
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
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        paynow_service_1.PaynowService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map