import express, { Request, Response } from 'express'
import mongoose from 'mongoose'
import { param } from 'express-validator'
import { requireAuth, validateRequest, NotFoundError, NotAuthorizedError } from '@aaesmailtickets/common'
import { Order, OrderStatus } from '../models/order'
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher'
import { natsWrapper } from '../events/nats-wrapper'

const router = express.Router()

router.delete(
  '/:orderId',

  requireAuth,

  [
    param('orderId')
      .notEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage('Valid Ticket ID must be provided!'),
  ],

  validateRequest,

  async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.orderId).populate('ticket')

    if (!order) {
      throw new NotFoundError()
    }

    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError()
    }

    order.status = OrderStatus.Cancelled
    await order.save()

    new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    })

    res.status(204).send({})
  }
)

export { router as deleteOrderRouter }
