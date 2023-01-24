import mongoose from 'mongoose'
import { OrderCancelledEvent } from '@aaesmailtickets/common'
import { Ticket } from '../../../models/ticket'
import { natsWrapper } from '../../nats-wrapper'
import { OrderCancelledListener } from '../order-cancelled-listener'

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client)

  const orderId = new mongoose.Types.ObjectId().toHexString()
  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
    userId: 'asdf',
  })
  ticket.set({ orderId })
  await ticket.save()

  const data: OrderCancelledEvent['data'] = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket.id
    }
  }

  const ack = jest.fn()

  return { listener, data, ticket, orderId, ack }
}

it('updates the ticket', async () => {
  const { listener, data, ticket, orderId, ack } = await setup()

  await listener.onMessage(data, ack)

  const updatedTicket = await Ticket.findById(ticket.id)

  expect(updatedTicket!.orderId).not.toBeDefined()
})

it('acks the message', async () => {
  const { listener, data, ticket, orderId, ack } = await setup()

  await listener.onMessage(data, ack)

  expect(ack).toHaveBeenCalled()
})

it('publishes an event', async () => {
  const { listener, data, ticket, orderId, ack } = await setup()

  await listener.onMessage(data, ack)

  expect(natsWrapper.client.publish).toHaveBeenCalled()

  const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1])

  expect(ticketUpdatedData.orderId).not.toBeDefined()
})
