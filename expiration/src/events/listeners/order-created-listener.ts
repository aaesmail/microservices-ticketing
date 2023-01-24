import { Ack, Listener, OrderCreatedEvent, Subjects } from '@aaesmailtickets/common'
import { queueGroupName } from './queue-group-name'
import { expirationQueue } from '../../queues/expiration-queue'

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated
  queueGroupName = queueGroupName

  async onMessage(data: OrderCreatedEvent['data'], ack: Ack) {
    await expirationQueue.add(
      {
        orderId: data.id,
      },
      {
        delay: new Date(data.expiresAt).getTime() - new Date().getTime(),
      }
    )

    ack()
  }
}
