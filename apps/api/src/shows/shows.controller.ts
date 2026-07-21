import { Controller, Get, Post, Param, Body, Headers, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ShowsService } from './shows.service';
import { SyncShowDto } from './dto/sync-show.dto';

@Controller('shows')
export class ShowsController {
  constructor(
    private readonly showsService: ShowsService,
    private readonly config: ConfigService,
  ) {}

  @Get()
  findAll() {
    return this.showsService.findAllPublished();
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.showsService.findBySlug(slug);
  }

  @Post('sync')
  syncFromYsams(
    @Body() dto: SyncShowDto,
    @Headers('x-api-key') apiKey: string,
  ) {
    if (apiKey !== this.config.get('YSAMS_API_KEY')) {
      throw new UnauthorizedException('Invalid API key');
    }
    return this.showsService.syncFromYsams(dto);
  }

  @Post('publish/:ysamsId')
  publishShow(
    @Param('ysamsId') ysamsId: string,
    @Headers('x-api-key') apiKey: string,
  ) {
    if (apiKey !== this.config.get('YSAMS_API_KEY')) {
      throw new UnauthorizedException('Invalid API key');
    }
    return this.showsService.publishShow(parseInt(ysamsId));
  }
}
