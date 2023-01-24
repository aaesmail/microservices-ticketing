import { ExpirationCompleteEvent, OrderStatus } from '@aaesmailtickets/common'
import mongoose from 'mongoose'
import { Order } from '../../../models/order'
import { Ticket } from '../../../models/ticket'
import { natsWrapper } from '../../nats-wrapper'
import { ExpirationCompleteListener } from '../expiration-complete-listener'

const setup = async () => {
  const listener = new ExpirationCompleteListener(natsWrapper.client)

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  })
  await ticket.save()

  const order = Order.build({
    status: OrderStatus.Created,
    userId: 'gsfds',
    expiresAt: new Date(),
    ticket,
  })
  await order.save()

  const data: ExpirationCompleteEvent['data'] = {
    orderId: order.id,
  }

  const ack = jest.fn()

  return { listener, ticket, order, data, ack }
}

it('updates the order status to cancelled', async () => {
  const { listener, ticket, order, data, ack } = await setup()
  await listener.onMessage(data, ack)

  const updatedOrder = await Order.findById(order.id)

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled)
})

it('emits an OrderCancelled event', async () => {
  const { listener, ticket, order, data, ack } = await setup()
  await listener.onMessage(data, ack)

  expect(natsWrapper.client.publish).toHaveBeenCalled()

  const eventData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1])

  expect(eventData.id).toEqual(order.id)
})

it('acks the message', async () => {
  const { listener, ticket, order, data, ack } = await setup()
  await listener.onMessage(data, ack)

  expect(ack).toHaveBeenCalled()
})
