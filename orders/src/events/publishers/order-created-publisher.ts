import { Publisher, OrderCreatedEvent, Subjects } from '@aaesmailtickets/common'

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}
