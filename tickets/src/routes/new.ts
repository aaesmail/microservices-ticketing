import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import { requireAuth, validateRequest } from '@aaesmailtickets/common'

import { Ticket } from '../models/ticket'
import { natsWrapper } from '../events/nats-wrapper'
import { TicketCreatedPublisher } from '../events/publishers/ticket-created-publisher'

const router = express.Router()

router.post(
  '/',

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
    const { title, price } = req.body

    const ticket = Ticket.build({
      title,
      price,
      userId: req.currentUser!.id,
    })

    await ticket.save()

    new TicketCreatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      version: ticket.version,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
    })

    res.status(201).send(ticket)
  }
)

export { router as createTicketRouter }
