import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  @Get('lookup')
  lookup(@Query('ref') ref: string, @Query('email') email: string) {
    return this.ordersService.lookup(ref, email);
  }

  @Get('status')
  getStatus(@Query('ref') ref: string) {
    return this.ordersService.getStatus(ref);
  }
}
