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
exports.ShowsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
function slugify(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}
let ShowsService = class ShowsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAllPublished() {
        return this.prisma.show.findMany({
            where: { status: { in: [client_1.ShowStatus.PUBLISHED, client_1.ShowStatus.SOLD_OUT] } },
            include: {
                ticketTypes: { orderBy: { sortOrder: 'asc' } },
            },
            orderBy: { showDate: 'asc' },
        });
    }
    async findBySlug(slug) {
        const show = await this.prisma.show.findUnique({
            where: { slug },
            include: {
                ticketTypes: { orderBy: { sortOrder: 'asc' } },
            },
        });
        if (!show)
            throw new common_1.NotFoundException(`Show "${slug}" not found`);
        return show;
    }
    async syncFromYsams(dto) {
        const slug = slugify(dto.title);
        const show = await this.prisma.show.upsert({
            where: { ysamsId: dto.ysamsId },
            create: {
                ysamsId: dto.ysamsId,
                title: dto.title,
                slug: slug,
                venue: dto.venue,
                city: dto.city,
                showDate: new Date(dto.showDate),
                doorsTime: dto.doorsTime,
                description: dto.description,
                posterUrl: dto.posterUrl,
                capacity: dto.capacity || 0,
                status: client_1.ShowStatus.DRAFT,
            },
            update: {
                title: dto.title,
                venue: dto.venue,
                city: dto.city,
                showDate: new Date(dto.showDate),
                doorsTime: dto.doorsTime,
                description: dto.description,
                posterUrl: dto.posterUrl,
                capacity: dto.capacity || 0,
            },
        });
        for (const tt of dto.ticketTypes) {
            const existing = await this.prisma.ticketType.findFirst({
                where: { showId: show.id, ysamsPoolId: tt.ysamsPoolId },
            });
            if (existing) {
                await this.prisma.ticketType.update({
                    where: { id: existing.id },
                    data: {
                        name: tt.name,
                        price: tt.price,
                        totalQty: tt.totalQty,
                        color: tt.color,
                        sortOrder: tt.sortOrder || 0,
                    },
                });
            }
            else {
                await this.prisma.ticketType.create({
                    data: {
                        showId: show.id,
                        ysamsPoolId: tt.ysamsPoolId,
                        name: tt.name,
                        price: tt.price,
                        totalQty: tt.totalQty,
                        color: tt.color,
                        sortOrder: tt.sortOrder || 0,
                    },
                });
            }
        }
        return this.prisma.show.findUnique({
            where: { id: show.id },
            include: { ticketTypes: true },
        });
    }
    async publishShow(ysamsId) {
        return this.prisma.show.update({
            where: { ysamsId },
            data: { status: client_1.ShowStatus.PUBLISHED },
        });
    }
    async updateSoldQty(ticketTypeId, qty) {
        return this.prisma.ticketType.update({
            where: { id: ticketTypeId },
            data: { soldQty: { increment: qty } },
        });
    }
};
exports.ShowsService = ShowsService;
exports.ShowsService = ShowsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ShowsService);
//# sourceMappingURL=shows.service.js.map