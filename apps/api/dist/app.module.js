"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const prisma_module_1 = require("./prisma/prisma.module");
const shows_module_1 = require("./shows/shows.module");
const orders_module_1 = require("./orders/orders.module");
const payments_module_1 = require("./payments/payments.module");
const tickets_module_1 = require("./tickets/tickets.module");
const notifications_module_1 = require("./notifications/notifications.module");
const ysams_module_1 = require("./ysams/ysams.module");
const qr_module_1 = require("./qr/qr.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            schedule_1.ScheduleModule.forRoot(),
            prisma_module_1.PrismaModule,
            shows_module_1.ShowsModule,
            orders_module_1.OrdersModule,
            payments_module_1.PaymentsModule,
            tickets_module_1.TicketsModule,
            notifications_module_1.NotificationsModule,
            ysams_module_1.YsamsModule,
            qr_module_1.QrModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map