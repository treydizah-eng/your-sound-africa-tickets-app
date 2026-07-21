import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SyncShowDto } from './dto/sync-show.dto';
import { ShowStatus } from '@prisma/client';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

@Injectable()
export class ShowsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllPublished() {
    return this.prisma.show.findMany({
      where: { status: { in: [ShowStatus.PUBLISHED, ShowStatus.SOLD_OUT] } },
      include: {
        ticketTypes: { orderBy: { sortOrder: 'asc' } },
      },
      orderBy: { showDate: 'asc' },
    });
  }

  async findBySlug(slug: string) {
    const show = await this.prisma.show.findUnique({
      where: { slug },
      include: {
        ticketTypes: { orderBy: { sortOrder: 'asc' } },
      },
    });
    if (!show) throw new NotFoundException(`Show "${slug}" not found`);
    return show;
  }

  async syncFromYsams(dto: SyncShowDto) {
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
        status: ShowStatus.DRAFT,
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
      } else {
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

  async publishShow(ysamsId: number) {
    return this.prisma.show.update({
      where: { ysamsId },
      data: { status: ShowStatus.PUBLISHED },
    });
  }

  async updateSoldQty(ticketTypeId: string, qty: number) {
    return this.prisma.ticketType.update({
      where: { id: ticketTypeId },
      data: { soldQty: { increment: qty } },
    });
  }
}
