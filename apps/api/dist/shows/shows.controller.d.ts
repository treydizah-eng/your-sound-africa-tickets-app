import { ConfigService } from '@nestjs/config';
import { ShowsService } from './shows.service';
import { SyncShowDto } from './dto/sync-show.dto';
export declare class ShowsController {
    private readonly showsService;
    private readonly config;
    constructor(showsService: ShowsService, config: ConfigService);
    findAll(): Promise<({
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
    findOne(slug: string): Promise<{
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
    syncFromYsams(dto: SyncShowDto, apiKey: string): Promise<{
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
    publishShow(ysamsId: string, apiKey: string): Promise<{
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
}
