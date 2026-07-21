import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
export declare class YsamsService {
    private readonly prisma;
    private readonly config;
    private readonly logger;
    constructor(prisma: PrismaService, config: ConfigService);
    recordSale(order: any): Promise<void>;
    private pushToYsams;
    retryFailedSyncs(): Promise<void>;
}
