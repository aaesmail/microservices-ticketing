import { Publisher, Subjects, TicketUpdatedEvent } from '@aaesmailtickets/common'

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated
}
