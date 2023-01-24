import { OrderCreatedEvent } from '@aaesmailtickets/common'
import { Order, OrderStatus } from '../../../models/order'
import mongoose from 'mongoose'
import { natsWrapper } from '../../nats-wrapper'
import { OrderCreatedListener } from '../order-created-listener'

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client)

  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    expiresAt: 'afasf',
    userId: 'adfasf',
    status: OrderStatus.Created,
    ticket: {
      id: 'afaf',
      price: 10,
    },
  }

  const ack = jest.fn()

  return { listener, data, ack }
}

it('replicates the order info', async () => {
  const { listener, data, ack } = await setup()
  await listener.onMessage(data, ack)

  const order = await Order.findById(data.id)

  expect(order!.price).toEqual(data.ticket.price)
})

it('acks the message', async () => {
  const { listener, data, ack } = await setup()
  await listener.onMessage(data, ack)

  expect(ack).toHaveBeenCalled()
})
