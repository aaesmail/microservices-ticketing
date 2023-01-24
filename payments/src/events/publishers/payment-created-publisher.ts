import { PaymentCreatedEvent, Publisher, Subjects } from '@aaesmailtickets/common'

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated
}
