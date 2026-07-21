"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsModule = void 0;
const common_1 = require("@nestjs/common");
const payments_controller_1 = require("./payments.controller");
const paynow_service_1 = require("./paynow.service");
const orders_module_1 = require("../orders/orders.module");
const tickets_module_1 = require("../tickets/tickets.module");
const notifications_module_1 = require("../notifications/notifications.module");
const ysams_module_1 = require("../ysams/ysams.module");
let PaymentsModule = class PaymentsModule {
};
exports.PaymentsModule = PaymentsModule;
exports.PaymentsModule = PaymentsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            (0, common_1.forwardRef)(() => orders_module_1.OrdersModule),
            tickets_module_1.TicketsModule,
            notifications_module_1.NotificationsModule,
            ysams_module_1.YsamsModule,
        ],
        controllers: [payments_controller_1.PaymentsController],
        providers: [paynow_service_1.PaynowService],
        exports: [paynow_service_1.PaynowService],
    })
], PaymentsModule);
//# sourceMappingURL=payments.module.js.map