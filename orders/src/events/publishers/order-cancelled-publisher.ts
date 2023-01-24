import { Publisher, OrderCancelledEvent, Subjects } from '@aaesmailtickets/common'

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
