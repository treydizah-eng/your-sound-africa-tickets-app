import { Module } from '@nestjs/common';
import { YsamsService } from './ysams.service';

@Module({
  providers: [YsamsService],
  exports: [YsamsService],
})
export class YsamsModule {}
