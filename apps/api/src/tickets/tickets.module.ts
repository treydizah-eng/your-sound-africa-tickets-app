import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { QrModule } from '../qr/qr.module';

@Module({
  imports: [QrModule],
  providers: [TicketsService],
  exports: [TicketsService],
})
export class TicketsModule {}
