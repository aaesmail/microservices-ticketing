import { Ack, Listener, PaymentCreatedEvent, Subjects } from '@aaesmailtickets/common'
import { queueGroupName } from './queue-group-name'
import { Order, OrderStatus } from '../../models/order'

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated
  queueGroupName = queueGroupName

  async onMessage(data: PaymentCreatedEvent['data'], ack: Ack) {
    const order = await Order.findById(data.orderId)

    if (!order) {
      throw new Error('Order not found!')
    }

    order.set({ status: OrderStatus.Complete })
    await order.save()

    ack()
  }
}
