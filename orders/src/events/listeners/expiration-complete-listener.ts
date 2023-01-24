import { Ack, ExpirationCompleteEvent, Listener, OrderStatus, Subjects } from '@aaesmailtickets/common'
import { Order } from '../../models/order'
import { OrderCancelledPublisher } from '../publishers/order-cancelled-publisher'
import { queueGroupName } from './queue-group-name'

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete
  queueGroupName = queueGroupName

  async onMessage(data: ExpirationCompleteEvent['data'], ack: Ack) {
    const order = await Order.findById(data.orderId).populate('ticket')

    if (!order) {
      throw new Error('Order not found')
    }

    if (order.status === OrderStatus.Complete) {
      return ack()
    }

    order.set({ status: OrderStatus.Cancelled })

    await order.save()

    await new OrderCancelledPublisher(this.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    })

    ack()
  }
}
