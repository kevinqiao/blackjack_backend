import { Controller, Get } from '@nestjs/common';
import { OrderManager } from 'src/service/OrderManager';

import { ORDER_STATUS } from 'src/types';

@Controller('orders')
export class OrderController {
  constructor(
    private readonly orderManager: OrderManager,
  ) {}

  @Get('open')
  async getOpenOrders(): Promise<any> {
    const orders = await this.orderManager.findOrders(ORDER_STATUS.OPEN);

    return { ok: true, message: orders };
  }
  @Get('completed')
  async getCompletedOrders(): Promise<any> {
    const orders = await this.orderManager.findOrders(ORDER_STATUS.COMPLETE);
    return { ok: true, message: orders };
  }
}
