import express, { Request, Response } from 'express'
import mongoose from 'mongoose'
import { body } from 'express-validator'
import { requireAuth, validateRequest, NotFoundError, NotAuthorizedError, BadRequestError } from '@aaesmailtickets/common'

import { stripe } from '../stripe'
import { Order, OrderStatus } from '../models/order'
import { Payment } from '../models/payment'
import { natsWrapper } from '../events/nats-wrapper'
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher'

const router = express.Router()

router.post(
  '/',

  requireAuth,

  [
    body('token')
      .notEmpty()
      .withMessage('Token is required!'),

    body('orderId')
      .notEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage('Valid Order ID must be provided!'),
  ],

  validateRequest,

  async (req: Request, res: Response) => {
    const { token, orderId } = req.body

    const order = await Order.findById(orderId)

    if (!order) {
      throw new NotFoundError()
    }

    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError()
    }

    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError('Cannot pay for a cancelled order!')
    }

    const existingPayment = await Payment.findOne({ orderId: order.id })

    if (existingPayment) {
      throw new BadRequestError('You have already paid for this order!')
    }

    const charge = await stripe.charges.create({
      currency: 'usd',
      amount: order.price * 100,
      source: token,
    })

    const payment = Payment.build({
      orderId: order.id,
      stripeId: charge.id,
    })
    await payment.save()

    new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      orderId: payment.orderId,
      stripeId: payment.stripeId,
    })

    res.status(201).send({ id: payment.id })
  }
)

export { router as createChargeRouter }
