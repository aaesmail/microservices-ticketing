import request from 'supertest'
import { app } from '../../app'

it('responds with details about the current user', async () => {
  const response = await request(app)
    .get('/currentuser')
    .set('Cookie', signin())
    .send()
    .expect(200)

  expect(response.body.currentUser.email).toEqual('test@test.com')
  expect(response.body.currentUser.id).toBeDefined()
})

it('responds with null if not authenticatd', async () => {
  const response = await request(app)
    .get('/currentuser')
    .send()
    .expect(200)

  expect(response.body.currentUser).toBeNull()
})
