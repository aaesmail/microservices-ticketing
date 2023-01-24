import { Publisher, Subjects, TicketCreatedEvent } from '@aaesmailtickets/common'

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated
}
