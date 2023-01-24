import { Subjects, Listener, TicketCreatedEvent, Ack } from '@aaesmailtickets/common'
import { queueGroupName } from './queue-group-name'
import { Ticket } from '../../models/ticket'

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated
  queueGroupName = queueGroupName

  async onMessage(data: TicketCreatedEvent['data'], ack: Ack) {
    const { id, title, price } = data
    const ticket = Ticket.build({ id, title, price })

    await ticket.save()

    ack()
  }
}
