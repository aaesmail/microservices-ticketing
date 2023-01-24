import mongoose from 'mongoose'
import { OrderCreatedEvent, OrderStatus } from '@aaesmailtickets/common'
import { OrderCreatedListener } from '../order-created-listener'
import { natsWrapper } from '../../nats-wrapper'
import { Ticket } from '../../../models/ticket'

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client)

  const ticket = Ticket.build({
    title: 'concert',
    price: 99,
    userId: 'asdf',
  })

  await ticket.save()

  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: 'asda',
    expiresAt: 'sdgsdf',
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  }

  const ack = jest.fn()

  return { listener, ticket, data, ack }
}

it('sets the userId of the ticket', async () => {
  const { listener, ticket, data, ack } = await setup()

  await listener.onMessage(data, ack)

  const updatedTicket = await Ticket.findById(ticket.id)

  expect(updatedTicket!.orderId).toEqual(data.id)
})

it('acks the message', async () => {
  const { listener, ticket, data, ack } = await setup()

  await listener.onMessage(data, ack)

  expect(ack).toHaveBeenCalled()
})

it('publishes a ticket updated event', async () => {
  const { ticket, listener, data, ack } = await setup()

  await listener.onMessage(data, ack)

  expect(natsWrapper.client.publish).toHaveBeenCalled()

  const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1])

  expect(ticketUpdatedData.orderId).toEqual(data.id)
})
