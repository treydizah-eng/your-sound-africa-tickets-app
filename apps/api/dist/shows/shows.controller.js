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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShowsController = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const shows_service_1 = require("./shows.service");
const sync_show_dto_1 = require("./dto/sync-show.dto");
let ShowsController = class ShowsController {
    constructor(showsService, config) {
        this.showsService = showsService;
        this.config = config;
    }
    findAll() {
        return this.showsService.findAllPublished();
    }
    findOne(slug) {
        return this.showsService.findBySlug(slug);
    }
    syncFromYsams(dto, apiKey) {
        if (apiKey !== this.config.get('YSAMS_API_KEY')) {
            throw new common_1.UnauthorizedException('Invalid API key');
        }
        return this.showsService.syncFromYsams(dto);
    }
    publishShow(ysamsId, apiKey) {
        if (apiKey !== this.config.get('YSAMS_API_KEY')) {
            throw new common_1.UnauthorizedException('Invalid API key');
        }
        return this.showsService.publishShow(parseInt(ysamsId));
    }
};
exports.ShowsController = ShowsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ShowsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':slug'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ShowsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)('sync'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [sync_show_dto_1.SyncShowDto, String]),
    __metadata("design:returntype", void 0)
], ShowsController.prototype, "syncFromYsams", null);
__decorate([
    (0, common_1.Post)('publish/:ysamsId'),
    __param(0, (0, common_1.Param)('ysamsId')),
    __param(1, (0, common_1.Headers)('x-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ShowsController.prototype, "publishShow", null);
exports.ShowsController = ShowsController = __decorate([
    (0, common_1.Controller)('shows'),
    __metadata("design:paramtypes", [shows_service_1.ShowsService,
        config_1.ConfigService])
], ShowsController);
//# sourceMappingURL=shows.controller.js.map