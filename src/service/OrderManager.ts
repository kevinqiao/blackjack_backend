import { Injectable } from '@nestjs/common';
import { JsonDB, Config } from 'node-json-db';
import { OrderModel, ORDER_STATUS } from '../types';
@Injectable()
export class OrderManager {
  db = new JsonDB(new Config('brokerdb', true, false, '/'));
  createOrder = async function (order: OrderModel): Promise<OrderModel> {
    order['id'] = Date.now() + '';
    const db_path =
      order['status'] === ORDER_STATUS.OPEN
        ? '/orders/open[]'
        : '/orders/complete[]';
    console.log(order);
    await this.db.push(db_path, order, true);
    return order;
  };
  findOrders = async function (status: number): Promise<OrderModel[]> {
    const db_path =
      status === ORDER_STATUS.OPEN ? '/orders/open' : '/orders/complete';
    console.log(db_path);
    const orders = await this.db.getData(db_path);
    return orders;
  };
  removeOrder = async function (order: OrderModel): Promise<OrderModel> {
    const db_path =
      order['status'] === ORDER_STATUS.OPEN
        ? '/orders/open[]'
        : '/orders/complete[]';
    const orders = await this.db.getData(db_path);
    await this.db.delete(db_path);
    await this.db.push(
      db_path,
      orders.filter((o: OrderModel) => o.id !== order.id),
      true,
    );
    return order;
  };
}
