import { Module, forwardRef } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaynowService } from './paynow.service';
import { OrdersModule } from '../orders/orders.module';
import { TicketsModule } from '../tickets/tickets.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { YsamsModule } from '../ysams/ysams.module';

@Module({
  imports: [
    forwardRef(() => OrdersModule),
    TicketsModule,
    NotificationsModule,
    YsamsModule,
  ],
  controllers: [PaymentsController],
  providers: [PaynowService],
  exports: [PaynowService],
})
export class PaymentsModule {}
