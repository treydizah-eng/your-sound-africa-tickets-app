import { PrismaService } from '../prisma/prisma.service';
import { SyncShowDto } from './dto/sync-show.dto';
export declare class ShowsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAllPublished(): Promise<({
        ticketTypes: {
            ysamsPoolId: number | null;
            name: string;
            price: import("@prisma/client/runtime/library").Decimal;
            totalQty: number;
            color: string | null;
            sortOrder: number;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            showId: string;
            currency: string;
            soldQty: number;
        }[];
    } & {
        ysamsId: number | null;
        title: string;
        venue: string;
        city: string;
        showDate: Date;
        doorsTime: string | null;
        description: string | null;
        posterUrl: string | null;
        capacity: number;
        id: string;
        slug: string;
        country: string;
        mapUrl: string | null;
        status: import(".prisma/client").$Enums.ShowStatus;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findBySlug(slug: string): Promise<{
        ticketTypes: {
            ysamsPoolId: number | null;
            name: string;
            price: import("@prisma/client/runtime/library").Decimal;
            totalQty: number;
            color: string | null;
            sortOrder: number;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            showId: string;
            currency: string;
            soldQty: number;
        }[];
    } & {
        ysamsId: number | null;
        title: string;
        venue: string;
        city: string;
        showDate: Date;
        doorsTime: string | null;
        description: string | null;
        posterUrl: string | null;
        capacity: number;
        id: string;
        slug: string;
        country: string;
        mapUrl: string | null;
        status: import(".prisma/client").$Enums.ShowStatus;
        createdAt: Date;
        updatedAt: Date;
    }>;
    syncFromYsams(dto: SyncShowDto): Promise<{
        ticketTypes: {
            ysamsPoolId: number | null;
            name: string;
            price: import("@prisma/client/runtime/library").Decimal;
            totalQty: number;
            color: string | null;
            sortOrder: number;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            showId: string;
            currency: string;
            soldQty: number;
        }[];
    } & {
        ysamsId: number | null;
        title: string;
        venue: string;
        city: string;
        showDate: Date;
        doorsTime: string | null;
        description: string | null;
        posterUrl: string | null;
        capacity: number;
        id: string;
        slug: string;
        country: string;
        mapUrl: string | null;
        status: import(".prisma/client").$Enums.ShowStatus;
        createdAt: Date;
        updatedAt: Date;
    }>;
    publishShow(ysamsId: number): Promise<{
        ysamsId: number | null;
        title: string;
        venue: string;
        city: string;
        showDate: Date;
        doorsTime: string | null;
        description: string | null;
        posterUrl: string | null;
        capacity: number;
        id: string;
        slug: string;
        country: string;
        mapUrl: string | null;
        status: import(".prisma/client").$Enums.ShowStatus;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateSoldQty(ticketTypeId: string, qty: number): Promise<{
        ysamsPoolId: number | null;
        name: string;
        price: import("@prisma/client/runtime/library").Decimal;
        totalQty: number;
        color: string | null;
        sortOrder: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        showId: string;
        currency: string;
        soldQty: number;
    }>;
}
