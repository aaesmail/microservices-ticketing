import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import { validateRequest, NotFoundError, requireAuth, NotAuthorizedError, BadRequestError } from '@aaesmailtickets/common'

import { Ticket } from '../models/ticket'
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher'
import { natsWrapper } from '../events/nats-wrapper'

const router = express.Router()

router.put(
  '/:id',

  requireAuth,

  [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Title is required'),

    body('price')
      .isFloat({ gt: 0 })
      .withMessage('Price must be greater than 0'),
  ],

  validateRequest,

  async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id)

    if (!ticket) {
      throw new NotFoundError()
    }

    if (ticket.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError()
    }

    if (ticket.orderId) {
      throw new BadRequestError('Cannot edit a reserved ticket!')
    }

    ticket.set({
      title: req.body.title,
      price: req.body.price,
    })

    await ticket.save()

    new TicketUpdatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      version: ticket.version,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
    })

    res.send(ticket)
  }
)

export { router as updateTicketRouter }
