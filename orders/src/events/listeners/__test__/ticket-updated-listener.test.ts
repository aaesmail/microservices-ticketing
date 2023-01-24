import { TicketUpdatedEvent } from '@aaesmailtickets/common'
import mongoose from 'mongoose'
import { natsWrapper } from '../../nats-wrapper'
import { Ticket } from '../../../models/ticket'
import { TicketUpdatedListener } from '../ticket-updated-listener'

const setup = async () => {
  const listener = new TicketUpdatedListener(natsWrapper.client)

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  })

  await ticket.save()

  const data: TicketUpdatedEvent['data'] = {
    version: ticket.version + 1,
    id: ticket.id,
    title: 'new concert',
    price: 999,
    userId: 'adasdsad',
  }

  const ack = jest.fn()

  return {
    ticket,
    listener,
    data,
    ack,
  }
}

it('finds, updates and saves a ticket', async () => {
  const { listener, ticket, data, ack } = await setup()

  await listener.onMessage(data, ack)

  const updatedTicket = await Ticket.findById(ticket.id)

  expect(updatedTicket).toBeDefined()
  expect(updatedTicket!.title).toEqual(data.title)
  expect(updatedTicket!.price).toEqual(data.price)
  expect(updatedTicket!.version).toEqual(data.version)
})

it('acks the message', async () => {
  const { listener, data, ack } = await setup()
  await listener.onMessage(data, ack)

  expect(ack).toHaveBeenCalled()
})

it('does not call ack if the event has a skipped version number', async () => {
  const { listener, ticket, data, ack } = await setup()
  data.version = 10

  try {
    await listener.onMessage(data, ack)
  } catch (err) { }

  expect(ack).not.toHaveBeenCalled()
})
