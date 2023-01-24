import { Ack, Listener, OrderCancelledEvent, Subjects } from '@aaesmailtickets/common'
import { Order, OrderStatus } from '../../models/order'
import { queueGroupName } from './queue-group-name'

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled
  queueGroupName = queueGroupName

  async onMessage(data: OrderCancelledEvent['data'], ack: Ack) {
    const order = await Order.findByEvent(data)

    if (!order) {
      throw new Error('Order not found!')
    }

    order.set({ status: OrderStatus.Cancelled })

    await order.save()

    ack()
  }
}
