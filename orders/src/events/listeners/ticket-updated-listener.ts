import { Subjects, Listener, TicketUpdatedEvent, Ack } from '@aaesmailtickets/common'
import { queueGroupName } from './queue-group-name'
import { Ticket } from '../../models/ticket'

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated
  queueGroupName = queueGroupName

  async onMessage(data: TicketUpdatedEvent['data'], ack: Ack) {
    const ticket = await Ticket.findByEvent(data)

    if (!ticket) {
      throw new Error('Ticket not found!')
    }

    const { title, price } = data
    ticket.set({ title, price })

    await ticket.save()

    ack()
  }
}
