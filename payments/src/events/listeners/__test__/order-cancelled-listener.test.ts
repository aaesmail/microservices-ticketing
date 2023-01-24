import { OrderCancelledEvent } from '@aaesmailtickets/common'
import { Order, OrderStatus } from '../../../models/order'
import mongoose from 'mongoose'
import { natsWrapper } from '../../nats-wrapper'
import { OrderCancelledListener } from '../order-cancelled-listener'

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client)

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    price: 10,
    userId: 'asdsad',
    version: 0,
  })

  await order.save()

  const data: OrderCancelledEvent['data'] = {
    id: order.id,
    version: 1,
    ticket: {
      id: 'afaf',
    },
  }

  const ack = jest.fn()

  return { listener, order, data, ack }
}

it('updates the status of the order to cancelled', async () => {
  const { listener, order, data, ack } = await setup()
  await listener.onMessage(data, ack)

  const updatedOrder = await Order.findById(order.id)

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled)
})

it('acks the message', async () => {
  const { listener, order, data, ack } = await setup()
  await listener.onMessage(data, ack)

  expect(ack).toHaveBeenCalled()
})
