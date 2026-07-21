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
var YsamsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.YsamsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const schedule_1 = require("@nestjs/schedule");
let YsamsService = YsamsService_1 = class YsamsService {
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
        this.logger = new common_1.Logger(YsamsService_1.name);
    }
    async recordSale(order) {
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
            items: order.items.map((i) => ({
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
    async pushToYsams(orderId, payload) {
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
            }
            else {
                const text = await response.text();
                this.logger.warn(`YSAMS sync HTTP ${response.status}: ${text}`);
            }
        }
        catch (err) {
            this.logger.error(`YSAMS sync failed for order ${payload.bookingRef}`, err);
            await this.prisma.syncEvent.updateMany({
                where: { orderId, synced: false },
                data: { retries: { increment: 1 }, error: String(err) },
            });
        }
    }
    async retryFailedSyncs() {
        const pending = await this.prisma.syncEvent.findMany({
            where: { synced: false, retries: { lt: 5 } },
            take: 20,
        });
        if (pending.length === 0)
            return;
        this.logger.log(`Retrying ${pending.length} failed YSAMS sync events`);
        for (const event of pending) {
            await this.pushToYsams(event.orderId || '', event.payload);
        }
    }
};
exports.YsamsService = YsamsService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_5_MINUTES),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], YsamsService.prototype, "retryFailedSyncs", null);
exports.YsamsService = YsamsService = YsamsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], YsamsService);
//# sourceMappingURL=ysams.service.js.map