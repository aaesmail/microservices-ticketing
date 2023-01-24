import request from 'supertest'
import mongoose from 'mongoose'
import { app } from '../../app'
import { natsWrapper } from '../../events/nats-wrapper'
import { Ticket } from '../../models/ticket'

it('returns a 404 if the provided id does not exist', async () => {
  const id = new mongoose.Types.ObjectId().toHexString()

  await request(app)
    .put(`/${id}`)
    .set('Cookie', signin())
    .send({ title: 'asdsad', price: 20 })
    .expect(404)
})

it('returns a 401 if the user is not authenticated', async () => {
  const id = new mongoose.Types.ObjectId().toHexString()

  await request(app)
    .put(`/${id}`)
    .send({ title: 'asdsad', price: 20 })
    .expect(401)
})

it('returns a 401 if the user does not own the ticket', async () => {
  const response = await request(app)
    .post('/')
    .set('Cookie', signin())
    .send({ title: 'asdsad', price: 20 })
    .expect(201)

  await request(app)
    .put(`/${response.body.id}`)
    .set('Cookie', signin())
    .send({ title: 'asdsad', price: 20 })
    .expect(401)
})

it('returns a 400 if the user provides an invalid title or price', async () => {
  const cookie = signin()

  const response = await request(app)
    .post('/')
    .set('Cookie', cookie)
    .send({ title: 'asdsad', price: 20 })
    .expect(201)

  await request(app)
    .put(`/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: '', price: 20 })
    .expect(400)

  await request(app)
    .put(`/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'iusdfhsd', price: -10 })
    .expect(400)
})

it('updates the ticket provided valid inputs', async () => {
  const cookie = signin()

  const response = await request(app)
    .post('/')
    .set('Cookie', cookie)
    .send({ title: 'old title', price: 20 })
    .expect(201)

  await request(app)
    .put(`/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: '    New Title    ', price: 100 })
    .expect(200)

  const ticketResponse = await request(app)
    .get(`/${response.body.id}`)
    .send()
    .expect(200)

  expect(ticketResponse.body.title).toEqual('New Title')
  expect(ticketResponse.body.price).toEqual(100)
})

it('publishes an event', async () => {
  const cookie = signin()

  const response = await request(app)
    .post('/')
    .set('Cookie', cookie)
    .send({ title: 'old title', price: 20 })
    .expect(201)

  await request(app)
    .put(`/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'New Title', price: 100 })
    .expect(200)

  expect(natsWrapper.client.publish).toHaveBeenCalled()
})

it('rejects updates if the ticket is reserved', async () => {
  const cookie = signin()

  const response = await request(app)
    .post('/')
    .set('Cookie', cookie)
    .send({ title: 'old title', price: 20 })
    .expect(201)

  const ticket = await Ticket.findById(response.body.id)
  ticket!.set({ orderId: new mongoose.Types.ObjectId().toHexString() })
  await ticket!.save()

  await request(app)
    .put(`/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'New Title', price: 100 })
    .expect(400)
})
