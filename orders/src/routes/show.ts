import express, { Request, Response } from 'express'
import mongoose from 'mongoose'
import { param } from 'express-validator'
import { requireAuth, validateRequest, NotFoundError, NotAuthorizedError } from '@aaesmailtickets/common'
import { Order } from '../models/order'

const router = express.Router()

router.get(
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

    res.send(order)
  }
)

export { router as showOrderRouter }
