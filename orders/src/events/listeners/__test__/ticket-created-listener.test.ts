import { TicketCreatedEvent } from '@aaesmailtickets/common'
import mongoose from 'mongoose'
import { TicketCreatedListener } from '../ticket-created-listener'
import { natsWrapper } from '../../nats-wrapper'
import { Ticket } from '../../../models/ticket'

const setup = async () => {
  const listener = new TicketCreatedListener(natsWrapper.client)

  const data: TicketCreatedEvent['data'] = {
    version: 0,
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString(),
  }

  const ack = jest.fn()

  return {
    listener,
    data,
    ack,
  }
}

it('creates and saves a ticket', async () => {
  const { listener, data, ack } = await setup()

  await listener.onMessage(data, ack)

  const ticket = await Ticket.findById(data.id)

  expect(ticket).toBeDefined()
  expect(ticket!.title).toEqual(data.title)
  expect(ticket!.price).toEqual(data.price)
})

it('acks the message', async () => {
  const { listener, data, ack } = await setup()

  await listener.onMessage(data, ack)

  expect(ack).toHaveBeenCalled()
})
