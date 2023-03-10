import request from 'supertest'
import { app } from '../../app'
import { Ticket } from '../../models/ticket'
import { natsWrapper } from '../../events/nats-wrapper'

it('has a route handler listening to / for post requests', async () => {
  const response = await request(app)
    .post('/')
    .send({})

  expect(response.status).not.toEqual(404)
})

it('can only be accessed if the user is signed in', async () => {
  await request(app)
    .post('/')
    .send({})
    .expect(401)
})

it('returns a status other than 401 if the user is signed in', async () => {
  const response = await request(app)
    .post('/')
    .set('Cookie', signin())
    .send({})

  expect(response.status).not.toEqual(401)
})

it('returns an error if an invalid title is provided', async () => {
  await request(app)
    .post('/')
    .set('Cookie', signin())
    .send({ price: 10 })
    .expect(400)

  await request(app)
    .post('/')
    .set('Cookie', signin())
    .send({ title: '', price: 10 })
    .expect(400)

  await request(app)
    .post('/')
    .set('Cookie', signin())
    .send({ title: '        ', price: 10 })
    .expect(400)
})

it('returns an error if an invalid price is provided', async () => {
  await request(app)
    .post('/')
    .set('Cookie', signin())
    .send({ title: 'iashbfi' })
    .expect(400)

  await request(app)
    .post('/')
    .set('Cookie', signin())
    .send({ title: 'iashbfi', price: 0 })
    .expect(400)

  await request(app)
    .post('/')
    .set('Cookie', signin())
    .send({ title: 'iashbfi', price: -10 })
    .expect(400)
})

it('creates a ticket with valid inputs', async () => {
  let tickets = await Ticket.find({})
  expect(tickets.length).toEqual(0)

  await request(app)
    .post('/')
    .set('Cookie', signin())
    .send({ title: '    some title  ', price: 20 })
    .expect(201)

  tickets = await Ticket.find({})
  expect(tickets.length).toEqual(1)
  expect(tickets[0].title).toEqual('some title')
  expect(tickets[0].price).toEqual(20)
})

it('publishes an event', async () => {
  await request(app)
    .post('/')
    .set('Cookie', signin())
    .send({ title: 'some title', price: 20 })
    .expect(201)

  expect(natsWrapper.client.publish).toHaveBeenCalled()
})
